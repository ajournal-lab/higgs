# Build a 3D tee from a flat outline: front and back panels are inflated by their distance
# to the sewn seams (shoulders, sleeves, sides), so the openings (neck, hem, cuffs) stay open.
import bpy, bmesh, math, sys, os
from mathutils import Vector, noise
import json
T = os.environ['TEE_DIR']
CFG = json.load(open(os.path.join(T, 'cfg.json')))
mode = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'still'

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

# half outline (x >= 0) in metres, front view, z up; mirrored for the left half
half = [(0.0, 0.665), (0.055, 0.68), (0.095, 0.715),            # front neckline
        (0.245, 0.69), (0.39, 0.585), (0.455, 0.48),            # shoulder seam, sleeve top
        (0.355, 0.405), (0.27, 0.485), (0.265, 0.25), (0.275, 0.0), (0.0, 0.0)]
poly = [(-x, z) for x, z in reversed(half[1:-1])] + half
poly = [p for i, p in enumerate(poly) if i == 0 or p != poly[i - 1]]
N = len(poly)
segs = [(poly[i], poly[(i + 1) % N]) for i in range(N)]
def seg_kind(a, b):
    mz = (a[1] + b[1]) / 2
    if mz < 0.01 and abs(a[1] - b[1]) < 1e-6: return 'open'          # hem
    if min(a[1], b[1]) >= 0.66 and max(abs(a[0]), abs(b[0])) <= 0.1: return 'open'  # neck
    if {round(abs(a[0]), 3), round(abs(b[0]), 3)} == {0.455, 0.355}: return 'open'  # cuff
    return 'seam'
kinds = [seg_kind(a, b) for a, b in segs]

def closest(p, a, b):
    ax, az = a; bx, bz = b; dx, dz = bx - ax, bz - az
    t = max(0, min(1, ((p[0] - ax) * dx + (p[1] - az) * dz) / (dx * dx + dz * dz)))
    q = (ax + t * dx, az + t * dz); return q, math.hypot(p[0] - q[0], p[1] - q[1])
def inside(p):
    c = False; x, z = p
    for (ax, az), (bx, bz) in segs:
        if (az > z) != (bz > z) and x < (bx - ax) * (z - az) / (bz - az) + ax: c = not c
    return c
def seam_dist(p):
    return min(closest(p, a, b)[1] for (a, b), k in zip(segs, kinds) if k == 'seam')

S = 0.0085
xs = [i * S for i in range(int(-0.47 / S), int(0.47 / S) + 1)]
zs = [j * S for j in range(0, int(0.73 / S) + 1)]
inside_pts = {}
for i, x in enumerate(xs):
    for j, z in enumerate(zs):
        if inside((x, z)): inside_pts[(i, j)] = (x, z)
cells = set()
for (i, j) in inside_pts:
    for di in (-1, 0):
        for dj in (-1, 0):
            cells.add((i + di, j + dj))
pts = {}
for (i, j) in cells:
    for c in ((i, j), (i + 1, j), (i, j + 1), (i + 1, j + 1)):
        if c in pts: continue
        if c in inside_pts: pts[c] = inside_pts[c]
        else:
            p = (xs[0] + c[0] * S, zs[0] + c[1] * S)
            pts[c] = min((closest(p, a, b) for a, b in segs), key=lambda r: r[1])[0]
# inflate like a pressurised membrane: solve lap(t) = -1, t = 0 on sewn seams, free at openings
import numpy as np
DEPTH = 0.09
keys = list(pts); idx = {k: n for n, k in enumerate(keys)}
fixed = np.zeros(len(keys), bool)
for k in keys:
    if k not in inside_pts:
        p = (xs[0] + k[0] * S, zs[0] + k[1] * S)
        r = min(((closest(p, a, b)[1], kd) for (a, b), kd in zip(segs, kinds)), key=lambda r: r[0])
        fixed[idx[k]] = r[1] == 'seam'
nb = np.full((len(keys), 4), -1)
for k, n in idx.items():
    for m, (di, dj) in enumerate(((1, 0), (-1, 0), (0, 1), (0, -1))):
        nb[n, m] = idx.get((k[0] + di, k[1] + dj), -1)
valid = nb >= 0; cnt = valid.sum(1); safe = np.where(valid, nb, 0)
tv = np.zeros(len(keys))
for _ in range(6000):
    tv = np.where(fixed, 0.0, ((tv[safe] * valid).sum(1) + 1.0) / np.maximum(cnt, 1))
tv = DEPTH * (tv / tv.max()) ** 0.75
tmap = {k: tv[idx[k]] for k in keys}
def thick(p, k=None): return tmap[k]
bm = bmesh.new(); uv = bm.loops.layers.uv.new('UVMap')
for side, sgn in (('front', -1), ('back', 1)):
    vmap = {}
    for k, (x, z) in pts.items():
        t = thick((x, z), k)
        wob = 0.006 * noise.noise(Vector((x * 7, z * 7, 3.1 if side == 'front' else 8.4))) * (t / DEPTH)
        v = bm.verts.new((x, sgn * (t + wob), z))
        vmap[k] = v
    for (i, j) in cells:
        q = [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]
        if all(c in vmap for c in q):
            vs = [vmap[c] for c in q]
            if sgn > 0: vs.reverse()
            try:
                f = bm.faces.new(vs)
            except ValueError:
                continue
            f.material_index = 0 if side == 'front' else 1
            for loop in f.loops:
                x, z = pts[[c for c in q if vmap[c] is loop.vert][0]]
                loop[uv].uv = ((0.5 + x) if side == 'front' else (0.5 - x), z / 0.75)
bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=0.0015)   # stitch the seams
bmesh.ops.dissolve_degenerate(bm, edges=bm.edges[:], dist=0.0005)
me = bpy.data.meshes.new('Tee'); bm.to_mesh(me); bm.free()
tee = bpy.data.objects.new('Tee', me); sc.collection.objects.link(tee)
for poly_ in me.polygons: poly_.use_smooth = True
pin = tee.vertex_groups.new(name='PIN_Cloth')
top = [(a, b) for (a, b), k in zip(segs, kinds) if k == 'seam' and min(a[1], b[1]) > 0.47 and max(abs(a[0]), abs(b[0])) > 0.1]
for v in me.vertices:
    d = min(closest((v.co.x, v.co.z), a, b)[1] for a, b in top)
    if d < 0.045: pin.add([v.index], 1.0 if d < 0.02 else 1.0 - (d - 0.02) / 0.025, 'REPLACE')
cl = tee.modifiers.new('Cloth', 'CLOTH'); cs = cl.settings
cs.quality = 8; cs.mass = 0.18; cs.air_damping = 1.5
cs.tension_stiffness = 12; cs.compression_stiffness = 12; cs.shear_stiffness = 6; cs.bending_stiffness = 0.35
cs.vertex_group_mass = 'PIN_Cloth'; cs.pin_stiffness = 1.0
cs.effector_weights.gravity = 0.35
cs.use_pressure = True; cs.uniform_pressure_force = 1.6; cs.pressure_factor = 1.0
cl.collision_settings.use_self_collision = False
cl.point_cache.frame_start = 1; cl.point_cache.frame_end = 70
sc.frame_start, sc.frame_end = 1, 70
for f in range(1, 41): sc.frame_set(f)
dg = bpy.context.evaluated_depsgraph_get()
settled = bpy.data.meshes.new_from_object(tee.evaluated_get(dg))
tee.modifiers.remove(cl); old = tee.data
bmo = bmesh.new(); bmo.from_mesh(old)
neck = sorted({v.index for e in bmo.edges if e.is_boundary for v in e.verts if v.co.z > 0.6 and abs(v.co.x) < 0.13})
print('neck verts', len(neck))
bmo.free()
for pa, pb in zip(old.polygons, settled.polygons): pb.material_index = pa.material_index
tee.data = settled
tee.vertex_groups.clear(); bpy.data.meshes.remove(old); me = settled
for poly_ in me.polygons: poly_.use_smooth = True
tee.modifiers.new('Thick', 'SOLIDIFY').thickness = 0.0025
collar = None
if CFG.get('collar'):
    # a polo collar: a band that stands up from the neck opening, then folds down over the shoulders
    P = [Vector(me.vertices[i].co) for i in neck]
    c = sum(P, Vector()) / len(P)
    P.sort(key=lambda p: math.atan2(p.x - c.x, -(p.y - c.y)))       # angle 0 = front centre
    cm = bmesh.new(); cuv = cm.loops.layers.uv.new('UVMap'); rows = []
    for p in P:
        ang = math.atan2(p.x - c.x, -(p.y - c.y))
        if abs(ang) < math.radians(9): rows.append(None); continue   # the open front of the collar
        d = Vector((p.x - c.x, p.y - c.y, 0)).normalized(); up = Vector((0, 0, 1))
        stand = p + up * 0.03 + d * 0.006
        fall = stand + d * 0.062 - up * 0.04
        tip = fall + d * 0.016 - up * 0.014
        rows.append([cm.verts.new(q) for q in (p, stand, fall, tip)])
    for a, b in zip(rows, rows[1:]):
        if a is None or b is None: continue
        for k in range(3):
            f = cm.faces.new((a[k], b[k], b[k + 1], a[k + 1]))
            for lp in f.loops: lp[cuv].uv = (0.5, 0.5)
    cme = bpy.data.meshes.new('Collar'); cm.to_mesh(cme); cm.free()
    for poly_ in cme.polygons: poly_.use_smooth = True
    collar = bpy.data.objects.new('Collar', cme); sc.collection.objects.link(collar)
    collar.modifiers.new('Thick', 'SOLIDIFY').thickness = 0.004
    cs_ = collar.modifiers.new('Smooth', 'SUBSURF'); cs_.levels = 1; cs_.render_levels = 2
sub = tee.modifiers.new('Smooth', 'SUBSURF'); sub.levels = 1; sub.render_levels = 2

def fabric_mat(name, img, mask):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']; L = nt.links.new
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(os.path.join(T, img))
    mk = nt.nodes.new('ShaderNodeTexImage'); mk.image = bpy.data.images.load(os.path.join(T, mask)); mk.image.colorspace_settings.name = 'Non-Color'
    L(tx.outputs['Color'], b.inputs['Base Color'])
    rough = nt.nodes.new('ShaderNodeMapRange'); rough.inputs['To Min'].default_value = 0.95; rough.inputs['To Max'].default_value = 0.55
    L(mk.outputs['Color'], rough.inputs['Value']); L(rough.outputs['Result'], b.inputs['Roughness'])
    sheen = nt.nodes.new('ShaderNodeMapRange'); sheen.inputs['To Min'].default_value = 0.04; sheen.inputs['To Max'].default_value = 0.0
    L(mk.outputs['Color'], sheen.inputs['Value']); L(sheen.outputs['Result'], b.inputs['Sheen Weight'])
    spec = nt.nodes.new('ShaderNodeMapRange'); spec.inputs['To Min'].default_value = 0.08; spec.inputs['To Max'].default_value = 0.5
    L(mk.outputs['Color'], spec.inputs['Value']); L(spec.outputs['Result'], b.inputs['Specular IOR Level'])
    b.inputs['Sheen Roughness'].default_value = 0.45; b.inputs['Sheen Tint'].default_value = (0.55, 0.55, 0.58, 1)
    co = nt.nodes.new('ShaderNodeTexCoord')
    knit = nt.nodes.new('ShaderNodeTexWave'); knit.wave_type = 'BANDS'; knit.bands_direction = 'Y'
    knit.inputs['Scale'].default_value = 520; knit.inputs['Distortion'].default_value = 1.5; knit.inputs['Detail'].default_value = 1
    L(co.outputs['UV'], knit.inputs['Vector'])
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1400; nz.inputs['Detail'].default_value = 1
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'FLOAT'; mix.inputs['Factor'].default_value = 0.45
    L(knit.outputs['Fac'], mix.inputs['A']); L(nz.outputs['Fac'], mix.inputs['B'])
    inkh = nt.nodes.new('ShaderNodeMath'); inkh.operation = 'MULTIPLY_ADD'; inkh.inputs[1].default_value = 0.6
    L(mk.outputs['Color'], inkh.inputs[0]); L(mix.outputs['Result'], inkh.inputs[2])
    bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 0.12; bp.inputs['Distance'].default_value = 0.002
    L(inkh.outputs['Value'], bp.inputs['Height']); L(bp.outputs['Normal'], b.inputs['Normal'])
    return m
me.materials.append(fabric_mat('TeeFront', 'tex_front.png', 'tex_front_mask.png'))
me.materials.append(fabric_mat('TeeBack', 'tex_back.png', 'tex_back_mask.png'))
if collar:
    collar.data.materials.append(fabric_mat('Collar', 'collar.png', 'collar_mask.png'))

# centre the tee on its pivot so it turns in place
tee.location = (0, 0, -0.36)
pivot = bpy.data.objects.new('Pivot', None); sc.collection.objects.link(pivot); tee.parent = pivot
if collar: collar.location = tee.location; collar.parent = pivot

w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.12
def area(name, loc, energy, size, color=(1, 1, 1)):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = energy; l.size = size; l.color = color
    o = bpy.data.objects.new(name, l); o.location = loc; sc.collection.objects.link(o)
    o.rotation_euler = (Vector((0, 0, 0.1)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
area('Key', (1.5, -1.9, 1.6), 300, 3.2, (1.0, 0.98, 0.95))
area('Fill', (-2.0, -1.4, 0.6), 160, 2.8); bpy.data.lights['Fill'].use_shadow = False
area('Top', (0.0, 0.0, 2.4), 260, 2.0)
area('Rim', (-1.0, 2.0, 1.2), 260, 1.8); bpy.data.lights['Rim'].use_shadow = False
bpy.ops.mesh.primitive_plane_add(size=3, location=(0, 0, -0.5))
floor = bpy.context.active_object; floor.is_shadow_catcher = True
sc.render.film_transparent = True
cam = bpy.data.cameras.new('Cam'); cam.lens = 60
co = bpy.data.objects.new('Cam', cam); sc.collection.objects.link(co); sc.camera = co
co.location = (0, -2.55, 0.14); co.rotation_euler = (math.radians(87), 0, 0)

sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = 64; sc.cycles.use_denoising = True
sc.render.resolution_x = sc.render.resolution_y = 720
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'; sc.view_settings.exposure = -1.6

if mode == 'none': pass
elif mode == 'still':
    for i, ang in enumerate((-35, 25, 180, 140)):
        pivot.rotation_euler = (0, 0, math.radians(ang))
        sc.render.filepath = os.path.join(T, f'still_{i}.png'); bpy.ops.render.render(write_still=True)
else:
    N_ = int(mode)
    os.makedirs(os.path.join(T, 'frames'), exist_ok=True)
    for i in range(N_):
        pivot.rotation_euler = (0, 0, math.radians(-35 + 360 * i / N_))
        sc.render.filepath = os.path.join(T, 'frames', f'f_{i:03d}.png'); bpy.ops.render.render(write_still=True)
print('verts', len(me.vertices), 'faces', len(me.polygons))
