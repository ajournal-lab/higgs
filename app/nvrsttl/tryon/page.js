'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect } from 'react';
import { ASSET, CartDrawer, Footer, Header } from '../NvrsttlSite';

/* Try-on: the After Hours cap is placed on a photo using face landmarks found in the browser.
   Nothing is uploaded. Ported from the storefront's tryon.html. */
function initTryOn() {
  const canvas = document.getElementById('try-canvas');
  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('try-status');
  const controls = document.getElementById('try-controls');
  const empty = document.getElementById('try-empty');
  const size = document.getElementById('try-size');
  const turn = document.getElementById('try-turn');
  const up = document.getElementById('try-up');
  const cmp = document.getElementById('try-compare');
  const fileInput = document.getElementById('try-file');

  const cap = new Image();
  cap.src = ASSET('img/cap.png');

  /* where the cap sits on the studio model, measured from that photo's face landmarks */
  const SRC = { brow: [480, 374], chin: [627, 552], roll: -37.5, capCenter: [457.5, 287.5] };
  const SRC_H = Math.hypot(SRC.chin[0] - SRC.brow[0], SRC.chin[1] - SRC.brow[1]);

  let photo = null, fit = null, base = null, flip = false, hidden = false, offset = [0, 0];
  let ready = false, pending = false, dragging = null, shadowCanvas = null;
  const say = (t) => { statusEl.textContent = t; };
  const deg = (a) => (a * 180) / Math.PI;
  const copy = (o) => JSON.parse(JSON.stringify(o));

  function shadowCap() {
    if (shadowCanvas) return shadowCanvas;
    shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = cap.width;
    shadowCanvas.height = cap.height;
    const c = shadowCanvas.getContext('2d');
    c.drawImage(cap, 0, 0);
    c.globalCompositeOperation = 'source-in';
    c.fillStyle = '#000';
    c.fillRect(0, 0, cap.width, cap.height);
    return shadowCanvas;
  }

  /* where the cap goes for the current flip. The cut-out keeps the studio model's head tilt, so a
     mirrored cap carries the opposite tilt and sits on the other side of the brow line */
  function pose() {
    if (!fit.brow) return fit;
    const m = flip ? -1 : 1;
    const rot = fit.roll - m * SRC.roll;
    const a = (rot * Math.PI) / 180;
    const v = [m * (SRC.capCenter[0] - SRC.brow[0]), SRC.capCenter[1] - SRC.brow[1]];
    const vx = (v[0] * Math.cos(a) - v[1] * Math.sin(a)) * fit.scale;
    const vy = (v[0] * Math.sin(a) + v[1] * Math.cos(a)) * fit.scale;
    return { cx: fit.brow[0] + vx, cy: fit.brow[1] + vy - 0.12 * fit.faceH, rot };
  }

  function draw() {
    if (!photo) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
    if (!fit || hidden) return;
    const at = pose();
    const s = fit.scale * (+size.value / 100);
    const r = ((at.rot + +turn.value) * Math.PI) / 180;
    const cx = at.cx + offset[0];
    const cy = at.cy + offset[1] - (+up.value / 100) * fit.faceH;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(r);
    if (flip) ctx.scale(-1, 1);
    ctx.scale(s, s);
    if ('filter' in ctx) {
      ctx.save();
      ctx.filter = `blur(${Math.max(2, 10 / s)}px)`;
      ctx.globalAlpha = 0.45;
      ctx.translate(0, 12);
      ctx.drawImage(shadowCap(), -cap.width / 2, -cap.height / 2);
      ctx.restore();
    }
    ctx.drawImage(cap, -cap.width / 2, -cap.height / 2);
    ctx.restore();
  }

  function placeFrom(det) {
    const P = det.landmarks.positions;
    const k = canvas.width / photo.naturalWidth;
    const mean = (ids) => {
      let x = 0, y = 0;
      ids.forEach((i) => { x += P[i].x; y += P[i].y; });
      return [(x / ids.length) * k, (y / ids.length) * k];
    };
    const brow = mean([17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
    const chin = [P[8].x * k, P[8].y * k];
    const eL = mean([36, 37, 38, 39, 40, 41]);
    const eR = mean([42, 43, 44, 45, 46, 47]);
    const faceH = Math.hypot(chin[0] - brow[0], chin[1] - brow[1]);
    const rollChin = deg(Math.atan2(chin[1] - brow[1], chin[0] - brow[0])) - 90;
    const rollEyes = deg(Math.atan2(eR[1] - eL[1], eR[0] - eL[0]));
    const roll = Math.abs(rollChin - rollEyes) < 25 ? (rollChin + rollEyes) / 2 : rollChin;
    const jawMid = [((P[0].x + P[16].x) / 2) * k, ((P[0].y + P[16].y) / 2) * k];
    const span = Math.hypot(P[16].x - P[0].x, P[16].y - P[0].y) * k;
    const dir = [Math.cos((roll * Math.PI) / 180), Math.sin((roll * Math.PI) / 180)];
    const yaw = ((P[30].x * k - jawMid[0]) * dir[0] + (P[30].y * k - jawMid[1]) * dir[1]) / span;
    flip = yaw > 0.12;
    fit = { brow, roll, scale: faceH / SRC_H, faceH };
    base = copy(fit);
  }

  function find() {
    say('Finding your face…');
    window.faceapi
      .detectSingleFace(photo, new window.faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
      .withFaceLandmarks()
      .then((det) => {
        if (!det) {
          fit = { cx: canvas.width / 2, cy: canvas.height * 0.25, scale: canvas.width / 900, rot: 0, faceH: canvas.height * 0.3 };
          base = copy(fit);
          say('No face found, so the cap is in the middle. Drag it onto your head and use the sliders.');
        } else {
          placeFrom(det);
          say('Done. Use the sliders or drag the cap to fine-tune the fit.');
        }
        controls.disabled = false;
        draw();
      })
      .catch(() => {
        say('The face finder hit a problem. Drag the cap into place by hand.');
        controls.disabled = false;
      });
  }

  function load(src) {
    const img = new Image();
    img.onload = () => {
      photo = img;
      fit = null;
      offset = [0, 0];
      hidden = false;
      size.value = 100;
      turn.value = 0;
      up.value = 0;
      const w = Math.min(900, img.naturalWidth);
      canvas.width = w;
      canvas.height = Math.round((w * img.naturalHeight) / img.naturalWidth);
      empty.hidden = true;
      draw();
      if (!ready) {
        say('Still loading the face finder. Your photo will update in a moment.');
        pending = true;
        return;
      }
      find();
    };
    img.onerror = () => say("That file couldn't be opened as a picture. Try a JPG or PNG photo.");
    img.src = src;
  }

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) load(URL.createObjectURL(f));
  };
  fileInput.addEventListener('change', onFile);

  const sampleBtns = Array.from(document.querySelectorAll('[data-sample]'));
  const onSample = (ev) => load(ev.currentTarget.getAttribute('data-sample'));
  sampleBtns.forEach((b) => b.addEventListener('click', onSample));

  const onInput = () => draw();
  [size, turn, up].forEach((el) => el.addEventListener('input', onInput));

  const flipBtn = document.getElementById('try-flip');
  const onFlip = () => { flip = !flip; draw(); };
  flipBtn.addEventListener('click', onFlip);

  const onCompare = () => {
    hidden = !hidden;
    cmp.setAttribute('aria-pressed', hidden ? 'true' : 'false');
    cmp.textContent = hidden ? 'Show cap' : 'Hide cap';
    draw();
  };
  cmp.addEventListener('click', onCompare);

  const resetBtn = document.getElementById('try-reset');
  const onReset = () => {
    if (base) fit = copy(base);
    offset = [0, 0];
    size.value = 100;
    turn.value = 0;
    up.value = 0;
    draw();
  };
  resetBtn.addEventListener('click', onReset);

  const pt = (e) => {
    const r = canvas.getBoundingClientRect();
    return [((e.clientX - r.left) * canvas.width) / r.width, ((e.clientY - r.top) * canvas.height) / r.height];
  };
  const onDown = (e) => {
    if (!fit) return;
    dragging = { p: pt(e), o: offset.slice() };
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging) return;
    const p = pt(e);
    offset = [dragging.o[0] + p[0] - dragging.p[0], dragging.o[1] + p[1] - dragging.p[1]];
    draw();
  };
  const onUp = () => { dragging = null; };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  cap.onload = draw;

  /* the face finder loads from the CDN script in the page; wait for it, then load its models */
  let waited = 0;
  const wait = setInterval(() => {
    waited += 300;
    if (window.faceapi) {
      clearInterval(wait);
      Promise.all([
        window.faceapi.nets.ssdMobilenetv1.loadFromUri(ASSET('models')),
        window.faceapi.nets.faceLandmark68Net.loadFromUri(ASSET('models')),
      ])
        .then(() => {
          ready = true;
          say(photo ? 'Ready.' : 'Ready. Add a photo to start.');
          if (pending && photo) find();
        })
        .catch(() => say("The face finder couldn't load. You can still place the cap by hand once you add a photo."));
    } else if (waited > 15000) {
      clearInterval(wait);
      say("The face finder couldn't load. You can still place the cap by hand once you add a photo.");
    }
  }, 300);

  return () => {
    clearInterval(wait);
    fileInput.removeEventListener('change', onFile);
    sampleBtns.forEach((b) => b.removeEventListener('click', onSample));
    [size, turn, up].forEach((el) => el.removeEventListener('input', onInput));
    flipBtn.removeEventListener('click', onFlip);
    cmp.removeEventListener('click', onCompare);
    resetBtn.removeEventListener('click', onReset);
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
  };
}

export default function TryOnPage() {
  useEffect(() => initTryOn(), []);

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/dist/face-api.js" strategy="afterInteractive" />
      <Header />
      <main className="sec wrap">
        <div className="tryon">
          <div className="try-stage" id="try-stage">
            <canvas id="try-canvas" width="900" height="1125" aria-label="Your photo with the After Hours cap" />
            <p className="try-empty" id="try-empty">Add a photo to start.</p>
          </div>
          <section className="try-panel" aria-labelledby="try-h">
            <p className="eyebrow">Try on</p>
            <h1 className="title" id="try-h">After Hours <b>on you</b></h1>
            <p className="small">Add a photo of yourself. The page finds your face and puts the After Hours cap on your head. Your photo stays on your device: nothing is uploaded.</p>
            <div className="try-step">
              <label className="btn" htmlFor="try-file">Choose a photo</label>
              <input id="try-file" type="file" accept="image/*" className="visually-hidden" />
              <span className="small">or use a sample:</span>
              <button className="try-sample" type="button" data-sample={ASSET('img/sample-1.jpg')}>
                <img src={ASSET('img/sample-1.jpg')} alt="Sample photo: man in a white tee" width="56" height="56" />
              </button>
              <button className="try-sample" type="button" data-sample={ASSET('img/sample-2.jpg')}>
                <img src={ASSET('img/sample-2.jpg')} alt="Sample photo: man in a black tee" width="56" height="56" />
              </button>
            </div>
            <p className="try-status" id="try-status" role="status" aria-live="polite">Loading the face finder…</p>
            <fieldset className="try-controls" id="try-controls" disabled>
              <legend className="eyebrow">Adjust the fit</legend>
              <label htmlFor="try-size">Size</label>
              <input id="try-size" type="range" min="50" max="180" defaultValue="100" />
              <label htmlFor="try-turn">Tilt</label>
              <input id="try-turn" type="range" min="-45" max="45" defaultValue="0" />
              <label htmlFor="try-up">Height</label>
              <input id="try-up" type="range" min="-60" max="60" defaultValue="0" />
              <p className="small">Drag the cap on the photo to move it.</p>
              <div className="try-buttons">
                <button className="btn ghost" type="button" id="try-flip">Flip</button>
                <button className="btn ghost" type="button" id="try-compare" aria-pressed="false">Hide cap</button>
                <button className="btn ghost" type="button" id="try-reset">Reset fit</button>
              </div>
            </fieldset>
            <Link className="btn" href="/nvrsttl/shop?cat=headwear">Shop After Hours</Link>
            <p className="small">This places the real cap on your photo in your browser. It&apos;s a preview of the look, not an AI-generated photo.</p>
          </section>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
