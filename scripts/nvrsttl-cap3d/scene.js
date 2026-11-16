// After Hours cap: an unstructured washed-charcoal dad cap with a metal cross and embroidered logo.
// Proportions, colours and the logo are taken from the product photos.
window.buildScene = function (logoImg) {
  const W = 720, H = 720;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setPixelRatio(1); renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x111111);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.7, 7.6); camera.lookAt(0, 0.3, 0.35);
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x141414, 0.7));
  const key = new THREE.DirectionalLight(0xfff1dd, 1.35); key.position.set(2.5, 4, 3.5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-3, 1.5, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xcfdcff, 0.8); rim.position.set(-3, 2.5, -3); scene.add(rim);

  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // pigment-washed cotton: warm charcoal base, cloudy fade, fine crackle speckle
  function washed(g, w0, h, sx) {
    sx = sx || 1; const w = w0 / sx; g.save(); g.scale(sx, 1);
    g.fillStyle = '#2b2724'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const x = rnd() * w, y = rnd() * h, r = 6 + rnd() * 34, light = rnd() > 0.45;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, light ? 'rgba(96,88,80,0.2)' : 'rgba(10,9,8,0.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    for (let i = 0; i < 30000; i++) { // crackle marks left by the wash
      const x = rnd() * w, y = rnd() * h, a = rnd() * 6.28, l = 3 + rnd() * 9;
      g.strokeStyle = rnd() > 0.5 ? 'rgba(120,112,102,0.2)' : 'rgba(8,7,6,0.25)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 90000; i++) { const v = 30 + rnd() * 60; g.fillStyle = `rgba(${v},${v - 4},${v - 8},0.22)`; g.fillRect(rnd() * w, rnd() * h, 1.5, 1); }
    g.restore();
  }
  function tex(c) { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; }
  function seam(g, x0, y0, x1, y1) { // worn-pale seam with twin stitch rows
    const nx = -(y1 - y0), ny = x1 - x0, n = Math.hypot(nx, ny), ox = nx / n, oy = ny / n;
    g.strokeStyle = 'rgba(104,96,86,0.3)'; g.lineWidth = 20; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = 'rgba(15,13,12,0.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.setLineDash([8, 6]); g.strokeStyle = 'rgba(34,30,27,0.85)'; g.lineWidth = 2.5;
    for (const d of [-9, 9]) { g.beginPath(); g.moveTo(x0 + ox * d, y0 + oy * d); g.lineTo(x1 + ox * d, y1 + oy * d); g.stroke(); }
    g.setLineDash([]);
  }

  // crown texture: u runs round the cap (front centre u = 0.25), v from rim (bottom) to button (top)
  const cc = document.createElement('canvas'); cc.width = 2048; cc.height = 1024; const cg = cc.getContext('2d');
  washed(cg, 2048, 1024, 0.45);
  for (let k = 0; k < 6; k++) {
    const x = ((k / 6 + 1 / 12) % 1) * 2048; seam(cg, x, 0, x, 1024);
    const ex = ((k / 6 + 2 / 12) % 1) * 2048, ey = 1024 * 0.36; // stitched eyelet in each panel
    cg.strokeStyle = 'rgba(28,25,22,0.95)'; cg.lineWidth = 7; cg.lineWidth = 5; cg.beginPath(); cg.ellipse(ex, ey, 6, 12, 0, 0, 7); cg.stroke();
    cg.fillStyle = '#060505'; cg.beginPath(); cg.ellipse(ex, ey, 3.5, 7, 0, 0, 7); cg.fill();
  }
  seam(cg, 0, 1024 - 22, 2048, 1024 - 22);
  // back opening above the strap
  cg.fillStyle = '#080707'; cg.beginPath(); cg.ellipse(0.75 * 2048, 1024, 95, 190, 0, Math.PI, 0); cg.fill();
  cg.strokeStyle = 'rgba(104,96,86,0.4)'; cg.lineWidth = 8; cg.beginPath(); cg.ellipse(0.75 * 2048, 1024, 101, 197, 0, Math.PI, 0); cg.stroke();
  // the embroidered logo, lifted from the product photo, on the wearer's left side
  const lh = 150, lw = lh * logoImg.width / logoImg.height * 0.45;
  cg.globalAlpha = 0.9; cg.drawImage(logoImg, 0.55 * 2048 - lw / 2, 1024 * 0.7 - lh / 2, lw, lh); cg.globalAlpha = 1;
  const crownTex = tex(cc);

  const RX = 1, RY = 0.98, RZ = 1.14;
  function crownPoint(sx, sy, sz) { // soft, low-profile crown: full at the back, sloping to the brim at the front
    const y = Math.pow(sy, 0.88) * (1 - 0.1 * Math.max(0, sz) * (1 - sy));
    const belly = 1 + 0.05 * Math.sin(Math.PI * Math.min(1, sy * 1.4));
    return new THREE.Vector3(sx * RX * belly, y * RY, sz * RZ * belly);
  }
  const cap = new THREE.Group(); scene.add(cap);
  const crownGeo = new THREE.SphereGeometry(1, 128, 64, 0, Math.PI * 2, 0, Math.PI / 2);
  const cp = crownGeo.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    const p = crownPoint(cp.getX(i), Math.max(0, cp.getY(i)), cp.getZ(i));
    // gentle panel puckering along the seams
    const ang = Math.atan2(cp.getZ(i), -cp.getX(i)), u = ((ang / (2 * Math.PI)) + 1) % 1;
    const d = Math.abs(((u * 6 + 0.5) % 1) - 0.5) * 2, puff = 1 + 0.012 * (1 - Math.pow(1 - d, 2));
    cp.setXYZ(i, p.x * puff, p.y, p.z * puff);
  }
  crownGeo.computeVertexNormals();
  cap.add(new THREE.Mesh(crownGeo, new THREE.MeshStandardMaterial({ map: crownTex, bumpMap: crownTex, bumpScale: 0.012, roughness: 1 })));
  cap.add(new THREE.Mesh(crownGeo, new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 1, side: THREE.BackSide })));

  const bc = document.createElement('canvas'); bc.width = bc.height = 256; washed(bc.getContext('2d'), 256, 256);
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.085, 24, 16), new THREE.MeshStandardMaterial({ map: tex(bc), roughness: 1 }));
  button.scale.y = 0.6; button.position.y = RY + 0.005; cap.add(button);

  // brim: long and pre-curved, with stitch rows that follow its edge
  const vc = document.createElement('canvas'); vc.width = vc.height = 1024; const vg = vc.getContext('2d');
  washed(vg, 1024, 1024);
  vg.setLineDash([8, 6]); vg.strokeStyle = 'rgba(30,27,24,0.85)'; vg.lineWidth = 2.5;
  for (let r = 1; r <= 6; r++) { const y = 1024 * (0.12 + r * 0.125); vg.beginPath(); vg.moveTo(0, y); vg.lineTo(1024, y); vg.stroke(); }
  vg.setLineDash([]); vg.strokeStyle = 'rgba(104,96,86,0.4)'; vg.lineWidth = 16; vg.beginPath(); vg.moveTo(0, 1013); vg.lineTo(1024, 1013); vg.stroke();
  const brimTex = tex(vc);
  const A0 = 0.5, A1 = Math.PI - 0.5, NS = 72, NT = 24, pos = [], uvs = [], idx = [];
  function brimPoint(s, t, off) {
    const a = A0 + (A1 - A0) * s, c = Math.cos(a), sn = Math.sin(a);
    const ix = c * RX * 0.97, iz = sn * RZ * 0.97;
    const ox = c * RX * 0.99, oz = sn * RZ * 0.97 + 0.86 * Math.pow(Math.sin(Math.PI * s), 0.6);
    const x = ix + (ox - ix) * t, z = iz + (oz - iz) * t;
    const y = 0.035 - 0.3 * x * x * (0.25 + 0.75 * t) - 0.16 * t * t * Math.sin(Math.PI * s) + off; // rolled sides, slight downward tip
    return [x, y, z];
  }
  for (const [off, flip] of [[0, false], [-0.045, true]]) {
    const base = pos.length / 3;
    for (let i = 0; i <= NS; i++) for (let j = 0; j <= NT; j++) { const p = brimPoint(i / NS, j / NT, off); pos.push(p[0], p[1], p[2]); uvs.push(i / NS, 1 - j / NT); }
    for (let i = 0; i < NS; i++) for (let j = 0; j < NT; j++) {
      const a = base + i * (NT + 1) + j, b = a + NT + 1;
      flip ? idx.push(a, a + 1, b, b, a + 1, b + 1) : idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const E = (NS + 1) * (NT + 1); // close the outer edge between the two faces
  for (let i = 0; i < NS; i++) { const a = i * (NT + 1) + NT, b = a + NT + 1; idx.push(a, b, a + E, b, b + E, a + E); }
  const brimGeo = new THREE.BufferGeometry();
  brimGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  brimGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  brimGeo.setIndex(idx); brimGeo.computeVertexNormals();
  cap.add(new THREE.Mesh(brimGeo, new THREE.MeshStandardMaterial({ map: brimTex, bumpMap: brimTex, bumpScale: 0.01, roughness: 1, side: THREE.DoubleSide })));

  // metal cross with flared arms, pinned to the front panel
  const gold = new THREE.MeshStandardMaterial({ color: 0xb09a62, roughness: 0.42, metalness: 0.55, emissive: 0x15110a });
  const cross = new THREE.Group();
  function arm(len, rot) {
    const a = 0.02, b = 0.052, s = new THREE.Shape();
    s.moveTo(-a, 0); s.lineTo(-a * 0.75, len * 0.5); s.quadraticCurveTo(-b * 1.1, len * 0.72, -b * 0.75, len * 0.9);
    s.quadraticCurveTo(-a * 0.6, len * 0.88, 0, len); s.quadraticCurveTo(a * 0.6, len * 0.88, b * 0.75, len * 0.9);
    s.quadraticCurveTo(b * 1.1, len * 0.72, a * 0.75, len * 0.5); s.lineTo(a, 0); s.closePath();
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.016, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 3 }), gold);
    m.rotation.z = rot; return m;
  }
  cross.add(arm(0.115, 0), arm(0.19, Math.PI), arm(0.095, Math.PI / 2), arm(0.095, -Math.PI / 2));
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.026, 16, 12), gold); boss.position.z = 0.022; boss.scale.z = 0.6; cross.add(boss);
  const th = 1.02, ph = Math.PI / 2 + 0.02; // on the front, a little above the brim
  const dir = [-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th)];
  const P = crownPoint(dir[0], dir[1], dir[2]);
  const P2 = crownPoint(-Math.cos(ph) * Math.sin(th - 0.05), Math.cos(th - 0.05), Math.sin(ph) * Math.sin(th - 0.05));
  const nrm = new THREE.Vector3(P.x / (RX * RX), P.y / (RY * RY), P.z / (RZ * RZ)).normalize();
  cross.position.copy(P).addScaledVector(nrm, 0.012);
  cross.up.copy(P2.clone().sub(P).normalize()); cross.lookAt(P.clone().add(nrm));
  cap.add(cross);

  // back strap with a metal slide buckle
  const strap = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 40, 0.5), new THREE.MeshStandardMaterial({ map: tex(bc), roughness: 1 }));
  strap.rotation.set(Math.PI / 2, 0, -Math.PI / 2 - 0.25); strap.scale.set(RX * 0.99, RZ * 0.99, 2.4); strap.position.y = 0.075; cap.add(strap);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.03), new THREE.MeshStandardMaterial({ color: 0x8d8a84, roughness: 0.35, metalness: 0.8 }));
  buckle.position.set(0, 0.075, -RZ * 1.0); cap.add(buckle);

  const sc = document.createElement('canvas'); sc.width = sc.height = 256; const sg = sc.getContext('2d');
  const gr = sg.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,0.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = gr; sg.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -0.3, 0.4); scene.add(shadow);

  cap.rotation.x = 0.05;
  window.renderFrame = function (t) { // t in 0..1 = one full turn, starting three-quarter front
    cap.rotation.y = -0.6 + t * Math.PI * 2; renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  };
};
