'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ASSET, CartDrawer, Footer, Header, PRODUCTS, useCart } from '../NvrsttlSite';

/* 3D-style product view with no 3D library. The product is a turntable video: drag left or right
   to turn it, and the video scrubs through the rotation. The file lives at
   public/nvrsttl/models/after-hours-turntable.mp4 (a short clip of the cap rotating through 360°).
   Until that file exists, the page shows the product photo instead. */
const TURNTABLE = { 'after-hours': ASSET('models/after-hours-turntable.mp4') };
const POSTER = { 'after-hours': ASSET('img/shop-after-hours.jpg') };
const DRAG_PX_PER_TURN = 480; // how far to drag for one full turn

function Turntable({ productId }) {
  const video = useRef(null);
  const drag = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const onMeta = () => { setReady(true); v.pause(); };
    const onErr = () => setFailed(true);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('error', onErr);
    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('error', onErr);
    };
  }, [productId]);

  const onDown = (e) => {
    if (!ready) return;
    drag.current = { x: e.clientX, t: video.current.currentTime };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current || !ready) return;
    const v = video.current;
    const turns = (e.clientX - drag.current.x) / DRAG_PX_PER_TURN;
    const len = v.duration || 1;
    // wrap around so the product keeps turning in either direction
    v.currentTime = (((drag.current.t + turns * len) % len) + len) % len;
  };
  const onUp = () => { drag.current = null; };

  if (failed || !TURNTABLE[productId]) {
    return (
      <div className="stage" style={{ aspectRatio: '4 / 5' }}>
        <img src={POSTER[productId]} alt="After Hours washed black cap" />
        <p className="hint">Turn view coming soon. Showing the photo.</p>
      </div>
    );
  }

  return (
    <div
      className="stage"
      style={{ aspectRatio: '4 / 5', cursor: ready ? 'grab' : 'default', touchAction: 'pan-y' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <video
        ref={video}
        src={TURNTABLE[productId]}
        poster={POSTER[productId]}
        muted
        playsInline
        preload="auto"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        aria-label="Drag to turn the After Hours cap"
      />
      <p className="hint">{ready ? 'Drag to turn' : 'Loading the turn view…'}</p>
    </div>
  );
}

export default function ThreeDPage() {
  const cart = useCart();
  const [id, setId] = useState('after-hours');
  const p = PRODUCTS.find((x) => x.id === id);
  const [size, setSize] = useState(p.sizes.find((s) => !p.soldOut.includes(s)));

  return (
    <>
      <Header />
      <main className="sec wrap">
        <div className="tryon">
          <Turntable productId={id} />
          <section className="try-panel" aria-labelledby="3d-h">
            <p className="eyebrow">Turn view</p>
            <h1 className="title" id="3d-h">{p.name}</h1>
            <p className="price">
              {p.was && <s>Rs. {p.was.toLocaleString('en-IN')}.00</s>} Rs. {p.price.toLocaleString('en-IN')}.00
            </p>
            {/* only the cap has a turn view so far; add other products once their clips exist */}
            <div className="try-step">
              <button type="button" className="btn ghost" aria-pressed="true" onClick={() => setId('after-hours')}>After Hours</button>
            </div>
            <fieldset className="sizes" style={{ border: 0, padding: 0, margin: '16px 0' }}>
              <legend className="eyebrow">Size</legend>
              {p.sizes.map((s) => {
                const out = p.soldOut.includes(s);
                return (
                  <label key={s}>
                    <input type="radio" name="size" value={s} disabled={out} checked={size === s} onChange={() => setSize(s)} />
                    <span>{s}</span>
                  </label>
                );
              })}
            </fieldset>
            <button className="btn" type="button" onClick={() => cart.add(p.id, size)}>Add to cart</button>
            <p className="small">Drag to turn the product. The turn view is a preview of the piece, not a photo of someone wearing it.</p>
            <Link className="btn ghost" href="/nvrsttl/tryon">Try it on you</Link>
          </section>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
