'use client';

import { useEffect, useRef, useState } from 'react';
import { ASSET } from './NvrsttlSite';

/* The tees stand on a ring that circles the viewer. When a tee reaches the front, the ring stops,
   that tee plays its 360° turntable clip once, and the ring moves on to the next tee.
   Add a tee by rendering its turntable (scripts/nvrsttl-tee3d) and adding a line here. */
const tee = (id, name) => ({ id, name, video: `models/${id}-turntable.mp4`, poster: `models/${id}-poster.jpg` });
export const TEES = [
  tee('lv-tee', 'Black print tee'),
  tee('olive-tee', 'Olive jacquard tee'),
  tee('black-polo', 'Black polo'),
  tee('boss-back-tee', 'Black back-print tee'),
  tee('boss-front-tee', 'Black logo tee'),
  tee('navy-zip-polo', 'Navy zip polo'),
];

const MIN_SLOTS = 5; // with fewer tees than this, the list repeats so the ring stays full
const TURN_MS = 1200; // time for the ring to bring the next tee to the front

export default function TeeCarousel() {
  const slots = [];
  while (slots.length < Math.max(MIN_SLOTS, TEES.length)) slots.push(TEES[slots.length % TEES.length]);
  const n = slots.length;
  const [step, setStep] = useState(0); // grows forever so the ring keeps turning one way
  const [moving, setMoving] = useState(false);
  const [still, setStill] = useState(false);
  const videos = useRef([]);
  const front = ((step % n) + n) % n;

  useEffect(() => {
    try { setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { /* ignore */ }
  }, []);

  // play the front tee's turn once the ring has stopped; move on when it ends
  useEffect(() => {
    if (moving || still) return undefined;
    const v = videos.current[front];
    let fallback;
    const next = () => { setMoving(true); setStep((s) => s + 1); };
    if (v) {
      v.currentTime = 0;
      const p = v.play();
      if (p && p.catch) p.catch(() => { fallback = setTimeout(next, 4000); });
      v.onended = next;
      v.onerror = () => { fallback = setTimeout(next, 4000); };
    } else {
      fallback = setTimeout(next, 4000);
    }
    return () => {
      clearTimeout(fallback);
      if (v) { v.onended = null; v.onerror = null; }
    };
  }, [front, moving, still]);

  useEffect(() => {
    if (!moving) return undefined;
    const t = setTimeout(() => setMoving(false), TURN_MS);
    return () => clearTimeout(t);
  }, [moving, step]);

  const angle = 360 / n;
  return (
    <section className="tee-ring-sec" aria-labelledby="ring-h">
      <div className="tee-ring-copy wrap">
        <p className="eyebrow">The collection</p>
        <h1 className="title" id="ring-h">Never <b>settle</b></h1>
      </div>
      <div className="tee-stage" aria-hidden="true">
        <div className="tee-ring" style={{ transform: `translateZ(calc(-1 * var(--ring-r))) rotateY(${-step * angle}deg)`, transitionDuration: `${TURN_MS}ms` }}>
          {slots.map((t, i) => {
            const isFront = i === front && !moving;
            const rel = (i - front + n) % n, dist = Math.min(rel, n - rel);
            return (
              <div key={i} className={`tee-card${i === front ? ' is-front' : ''}`} style={{ transform: `rotateY(${i * angle}deg) translateZ(var(--ring-r))`, opacity: Math.max(0.25, 1 - dist * 0.3), transitionDuration: `${TURN_MS}ms` }}>
                <img src={ASSET(t.poster)} alt="" className={isFront && !still ? 'hide' : ''} />
                <video
                  ref={(el) => { videos.current[i] = el; }}
                  src={ASSET(t.video)}
                  muted
                  playsInline
                  preload={i === front || i === (front + 1) % n ? 'auto' : 'metadata'}
                  className={isFront && !still ? '' : 'hide'}
                />
              </div>
            );
          })}
        </div>
      </div>
      <p className="tee-ring-name">{slots[front].name}</p>
    </section>
  );
}
