// Procedural After Hours cap, built with three.js
(function () {
  const W = 720, H = 720;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setPixelRatio(1);
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.5, 6.6); camera.lookAt(0, 0.25, 0.25);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x1a1a1a, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(2.5, 4, 3.5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfd4ff, 0.9); rim.position.set(-3, 2, -3); scene.add(rim);

  // washed black fabric texture with panel seams, eyelets, cross and wordmark
  function fabric(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = '#1b1b1c'; g.fillRect(0, 0, w, h);
    let s = 7;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 26000; i++) { // woven grain
      const v = 20 + rnd() * 34; g.fillStyle = `rgba(${v},${v},${v + 2},0.5)`;
      g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1);
    }
    for (let i = 0; i < 60; i++) { // washed, faded patches
      const x = rnd() * w, y = rnd() * h, r = 30 + rnd() * 120;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(70,70,74,0.16)'); gr.addColorStop(1, 'rgba(70,70,74,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    if (draw) draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    return t;
  }
  const crownTex = fabric(2048, 1024, (g, w, h) => {
    for (let k = 0; k < 6; k++) { // six panel seams with stitch lines (front centre is u = 0.25)
      const x = ((k / 6 + 1 / 12) % 1) * w;
      g.strokeStyle = 'rgba(0,0,0,0.55)'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke();
      g.setLineDash([9, 7]); g.strokeStyle = 'rgba(95,95,98,0.7)'; g.lineWidth = 2;
      for (const d of [-9, 9]) { g.beginPath(); g.moveTo(x + d, 0); g.lineTo(x + d, h); g.stroke(); }
      g.setLineDash([]);
      const ex = ((k / 6 + 2 / 12) % 1) * w; // eyelet mid-panel
      g.fillStyle = '#050505'; g.beginPath(); g.arc(ex, h * 0.42, 9, 0, 7); g.fill();
      g.strokeStyle = 'rgba(90,90,92,0.8)'; g.lineWidth = 3; g.beginPath(); g.arc(ex, h * 0.42, 12, 0, 7); g.stroke();
    }
    g.strokeStyle = 'rgba(95,95,98,0.7)'; g.setLineDash([9, 7]); g.lineWidth = 2; // rim stitch
    g.beginPath(); g.moveTo(0, h - 26); g.lineTo(w, h - 26); g.stroke(); g.setLineDash([]);
    // tonal embroidered cross on the front
    const cx = 0.25 * w, cy = h * 0.66;
    g.fillStyle = '#3a3a3d';
    g.fillRect(cx - 9, cy - 62, 18, 124); g.fillRect(cx - 40, cy - 30, 80, 18);
    g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 2;
    g.strokeRect(cx - 9, cy - 62, 18, 124); g.strokeRect(cx - 40, cy - 30, 80, 18);
    // tonal wordmark on the side
    g.fillStyle = '#3c3c3f'; g.font = '600 46px Arial, Helvetica, sans-serif'; g.textAlign = 'center';
    const word = 'NVRSTTL'; let x0 = 0.5 * w - 3 * 44;
    for (const ch of word) { g.fillText(ch, x0, h * 0.8); x0 += 44; }
  });
  const brimTex = fabric(1024, 1024, (g, w, h) => {
    g.strokeStyle = 'rgba(95,95,98,0.6)'; g.setLineDash([9, 7]); g.lineWidth = 2;
    for (let i = 1; i <= 5; i++) { g.beginPath(); g.ellipse(w / 2, h * 0.1, w * 0.1 * i + 60, h * 0.13 * i + 60, 0, 0, 7); g.stroke(); }
  });

  const cap = new THREE.Group(); scene.add(cap);
  const RX = 1, RY = 0.8, RZ = 1.1;
  const cloth = new THREE.MeshStandardMaterial({ map: crownTex, roughness: 0.95, metalness: 0, side: THREE.FrontSide });
  const crown = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2), cloth);
  // flatten the top a little and push the front panels up, like a structured cap
  const cp = crown.geometry.attributes.position;
  for (let i = 0; i < cp.count; i++) {
    let x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i);
    const front = Math.max(0, z);
    y = Math.pow(y, 0.82) * (1 + 0.1 * front * (1 - y));
    cp.setXYZ(i, x * RX, y * RY, z * RZ);
  }
  crown.geometry.computeVertexNormals(); cap.add(crown);
  const inside = new THREE.Mesh(crown.geometry, new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 1, side: THREE.BackSide }));
  cap.add(inside);
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), new THREE.MeshStandardMaterial({ map: brimTex, roughness: 0.95 }));
  button.scale.y = 0.55; button.position.y = RY + 0.005; cap.add(button);

  // brim: a curved visor attached along the front of the crown rim
  const shape = new THREE.Shape(); const A0 = 0.38, A1 = Math.PI - 0.38, N = 48;
  for (let i = 0; i <= N; i++) { const a = A0 + (A1 - A0) * i / N; const p = [Math.cos(a) * RX * 0.9, Math.sin(a) * RZ * 0.9]; i ? shape.lineTo(p[0], p[1]) : shape.moveTo(p[0], p[1]); }
  for (let i = N; i >= 0; i--) { const t = i / N, a = A0 + (A1 - A0) * t; shape.lineTo(Math.cos(a) * RX * 1.0, Math.sin(a) * RZ * 0.95 + 0.72 * Math.pow(Math.sin(Math.PI * t), 0.75)); }
  const brimGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 48, steps: 1 });
  brimGeo.rotateX(Math.PI / 2);
  const bp = brimGeo.attributes.position, uv = brimGeo.attributes.uv;
  for (let i = 0; i < bp.count; i++) {
    const x = bp.getX(i), z = bp.getZ(i);
    uv.setXY(i, 0.5 + x * 0.42, 0.05 + z * 0.42);
    bp.setY(i, bp.getY(i) + 0.07 - 0.1 * x * x - 0.08 * Math.max(0, z - 0.9)); // side curve and slight droop
  }
  brimGeo.computeVertexNormals();
  cap.add(new THREE.Mesh(brimGeo, new THREE.MeshStandardMaterial({ map: brimTex, roughness: 0.95, side: THREE.DoubleSide })));

  // back strap opening and strap
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 10, 32, Math.PI), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9 }));
  strap.rotation.set(0, 0, 0); strap.position.set(0, 0.03, -RZ * 0.97); strap.scale.set(1, 0.55, 0.4); cap.add(strap);
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.03), new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.35, metalness: 0.9 }));
  buckle.position.set(0, 0.06, -RZ * 1.0); cap.add(buckle);

  // soft contact shadow
  const sc = document.createElement('canvas'); sc.width = sc.height = 256; const sg = sc.getContext('2d');
  const gr = sg.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  sg.fillStyle = gr; sg.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -0.22, 0.3); scene.add(shadow);

  cap.rotation.x = 0.06;
  window.renderFrame = function (t) { // t in 0..1 = one full turn, starting three-quarter front
    cap.rotation.y = -0.6 + t * Math.PI * 2;
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/png');
  };
})();
