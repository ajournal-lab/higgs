# Build the front/back textures and print masks for each garment in its own folder.
import json, os, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageOps
G = os.path.dirname(os.path.abspath(__file__))
W, H = 2048, 1536                        # u: x -0.5..0.5 m, v: z 0..0.75 m
def U(x): return int((0.5 + x) * W)
def V(z): return int((1 - z / 0.75) * H)

def cotton(rgb, seed):
    im = Image.new('RGB', (W, H), tuple(rgb)); px = im.load(); r = random.Random(seed)
    for _ in range(200000):
        x, y = r.randrange(W), r.randrange(H); v = r.randint(-4, 4); c = px[x, y]
        px[x, y] = (max(0, c[0] + v), max(0, c[1] + v), max(0, c[2] + v))
    return im.filter(ImageFilter.GaussianBlur(0.6))

def jacquard(rgb, tile_path, tile_m):
    t = Image.open(tile_path).convert('L')
    detail = ImageChops.subtract(t, t.filter(ImageFilter.GaussianBlur(30)), 1, 128)   # keep the weave, drop the photo's light
    size = int(tile_m * W); detail = detail.resize((size, size), Image.LANCZOS)
    big = Image.new('L', (W, H))
    for i in range(0, W, size):
        for j in range(0, H, size):
            d = detail if (i // size) % 2 == 0 else ImageOps.mirror(detail)
            big.paste(d, (i, j))
    base = Image.new('RGB', (W, H), tuple(rgb))
    return Image.merge('RGB', [Image.eval(ImageChops.add(Image.new('L', (W, H), c), big, 1, -128), lambda v: v) for c in rgb])

def jacquard_drawn(rgb):
    # interlocking arrow chains like the olive tee's jacquard, drawn as raised ridges
    im = cotton(rgb, 3); d = ImageDraw.Draw(im)
    dark = tuple(int(c * 0.72) for c in rgb); light = tuple(min(255, int(c * 1.18)) for c in rgb)
    col, row, w = 0.046, 0.06, 0.017
    for k in range(-1, int(1 / col) + 2):
        cx = -0.5 + k * col
        for j in range(-1, int(0.75 / row) + 2):
            z = j * row + (row / 2 if k % 2 else 0)
            pts = [(cx, z), (cx - w, z + row * 0.28), (cx - w, z + row * 0.62), (cx, z + row * 0.9),
                   (cx + w, z + row * 0.62), (cx + w, z + row * 0.28), (cx, z)]
            for off, colr in ((0.0014, light), (0.0, dark)):
                d.line([(U(x + off), V(zz + off)) for x, zz in pts], fill=colr, width=7)
            d.line([(U(cx), V(z + row * 0.9)), (U(cx), V(z + row))], fill=dark, width=7)
    return im.filter(ImageFilter.GaussianBlur(1.6))

def cut_print(path, thresh, palette=None, gain=8):
    pr = Image.open(path).convert('RGB'); L = pr.convert('L').filter(ImageFilter.GaussianBlur(0.6))
    a = L.point(lambda v: 0 if v < thresh else min(255, int((v - thresh) * gain)))
    if palette:
        px = pr.load()
        for y in range(pr.height):
            for x in range(pr.width):
                r, g, b = px[x, y]
                px[x, y] = min(palette, key=lambda p: (p[0]-r)**2 + (p[1]-g)**2 + (p[2]-b)**2)
    pr = pr.convert('RGBA'); pr.putalpha(a.filter(ImageFilter.MedianFilter(3))); return pr

def place(tex, mask, pr, cx, cz, width):
    pw = int(width * W); ph = int(pw * pr.height / pr.width); p = pr.resize((pw, ph), Image.LANCZOS)
    pos = (U(cx) - pw // 2, V(cz) - ph // 2); tex.paste(p, pos, p); mask.paste(p.getchannel('A'), pos, p.getchannel('A'))

def raglan(tex, rgb, cuff_rgb):
    d = ImageDraw.Draw(tex)
    for s in (1, -1):
        sleeve = [(0.10, 0.705), (0.30, 0.76), (0.52, 0.76), (0.52, 0.36), (0.355, 0.405), (0.275, 0.47)]
        d.polygon([(U(s * x), V(z)) for x, z in sleeve], fill=tuple(rgb))
        a, b, n = (0.455, 0.48), (0.355, 0.405), (-0.6, 0.8)
        band = [(a[0] - n[0] * 0.03, a[1] - n[1] * 0.03), (b[0] - n[0] * 0.03, b[1] - n[1] * 0.03), (b[0] + n[0] * 0.02, b[1] + n[1] * 0.02), (a[0] + n[0] * 0.02, a[1] + n[1] * 0.02)]
        d.polygon([(U(s * x), V(z)) for x, z in band], fill=tuple(cuff_rgb))
    return tex

def placket(tex, kind, rgb):
    d = ImageDraw.Draw(tex)
    if kind == 'buttons':
        d.rectangle([U(-0.022), V(0.665), U(0.022), V(0.52)], outline=tuple(min(255, c + 22) for c in rgb), width=3)
        for z in (0.615, 0.565):
            d.ellipse([U(-0.006), V(z + 0.006), U(0.006), V(z - 0.006)], fill=(58, 58, 60), outline=(25, 25, 26), width=2)
    if kind == 'zip':
        d.rectangle([U(-0.022), V(0.665), U(0.022), V(0.50)], fill=(226, 220, 208))
        d.rectangle([U(-0.006), V(0.665), U(0.006), V(0.50)], fill=(30, 32, 34))
        for z in range(500, 665, 4):
            d.line([U(-0.005), V(z / 1000), U(0.005), V(z / 1000)], fill=(140, 140, 142), width=2)

G_ = json.load(open(os.path.join(G, 'garments.json')))
for g in G_:
    out = os.path.join(G, g['id']); os.makedirs(out, exist_ok=True)
    for side in ('front', 'back'):
        if g.get('tile'): tex = jacquard_drawn(g['rgb'])
        else: tex = cotton(g['rgb'], 7 if side == 'front' else 11)
        mask = Image.new('L', (W, H), 0)
        if g.get('raglan'): raglan(tex, g['raglan'], g['rgb'])
        if side == 'front' and g.get('placket'): placket(tex, g['placket'], g['rgb'])
        for p in g.get('prints', []):
            if p['side'] == side:
                pr = cut_print(os.path.join(G, p['image']), p['thresh'], [tuple(c) for c in p['palette']] if p.get('palette') else None)
                place(tex, mask, pr, p['cx'], p['cz'], p['width'])
        tex.save(os.path.join(out, f'tex_{side}.png')); mask.save(os.path.join(out, f'tex_{side}_mask.png'))
    json.dump({'collar': g.get('collar')}, open(os.path.join(out, 'cfg.json'), 'w'))
    if g.get('collar'):
        cotton(g['collar']['rgb'], 5).resize((256, 256)).save(os.path.join(out, 'collar.png')); Image.new('L', (64, 64), 0).save(os.path.join(out, 'collar_mask.png'))
    print('prepared', g['id'])
