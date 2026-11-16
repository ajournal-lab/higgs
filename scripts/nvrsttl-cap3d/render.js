const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = __dirname, N = 120;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 720, height: 720 } });
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.setContent('<html><body style="margin:0;background:#111"></body></html>');
  await p.addScriptTag({ path: path.join(dir, 'node_modules/three/build/three.min.js') });
  await p.addScriptTag({ path: path.join(dir, 'scene.js') });
  const logo = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, 'logo.png')).toString('base64');
  const cloth = 'data:image/png;base64,' + fs.readFileSync(path.join(dir, 'cloth.png')).toString('base64');
  await p.evaluate(([a, b]) => new Promise((res, rej) => { const i1 = new Image(), i2 = new Image(); let n = 0; const go = () => { if (++n === 2) { window.buildScene(i1, i2); res(); } }; i1.onload = go; i2.onload = go; i1.onerror = i2.onerror = rej; i1.src = a; i2.src = b; }), [logo, cloth]);
  fs.mkdirSync(path.join(dir, 'frames'), { recursive: true });
  for (let i = 0; i < N; i++) {
    const url = await p.evaluate(t => window.renderFrame(t), i / N);
    fs.writeFileSync(path.join(dir, 'frames', `f_${String(i).padStart(3, '0')}.png`), Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log('rendered', N);
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
