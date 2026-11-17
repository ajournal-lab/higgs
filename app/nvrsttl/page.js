'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ASSET, CREW, CartDrawer, Footer, Header, useCart } from './NvrsttlSite';
import TeeCarousel from './TeeCarousel';

function Hero() {
  const [sound, setSound] = useState(false);
  return (
    <section className="hero" aria-labelledby="hero-h">
      <video autoPlay muted={!sound} loop playsInline preload="auto" poster={ASSET('img/reel-poster.jpg')} aria-label="NVRSTTL film">
        <source src={ASSET('img/reel.webm')} type="video/webm" />
        <source src={ASSET('img/reel.mp4')} type="video/mp4" />
      </video>
      <div className="hero-copy wrap">
        <p className="eyebrow">NVRSTTL</p>
        <h1 id="hero-h">Substance over spectacle.</h1>
        <div className="row">
          <Link className="btn light" href="/nvrsttl/shop">Shop</Link>
          <a className="btn ghost-light" href="#about">About</a>
        </div>
      </div>
      <button className="sound" type="button" aria-pressed={sound} onClick={() => setSound(!sound)}>
        {sound ? 'Sound off' : 'Sound on'}
      </button>
    </section>
  );
}

function Crew() {
  const [i, setI] = useState(0);
  const c = CREW[i];
  return (
    <section className="sec wrap" aria-labelledby="crew-h">
      <div className="crew">
        <div className="crew-copy">
          <p className="eyebrow">From our shoots</p>
          <h2 className="title" id="crew-h">Meet the <b>crew</b></h2>
          <p>The NVRSTTL crew, from our own photos and film.</p>
          <Link className="btn ghost" href="/nvrsttl/shop">Shop the looks</Link>
        </div>
        <div className="stage">
          {c.video ? (
            <video key={c.video} muted loop playsInline autoPlay preload="metadata" poster={ASSET(c.poster)}>
              <source src={ASSET(`${c.video}.webm`)} type="video/webm" />
              <source src={ASSET(`${c.video}.mp4`)} type="video/mp4" />
            </video>
          ) : (
            <img src={ASSET(c.img)} alt={c.look} />
          )}
        </div>
        <ul className="crew-list">
          {CREW.map((m, n) => (
            <li key={m.name}>
              <button type="button" aria-pressed={n === i} onClick={() => setI(n)}>
                <img src={ASSET(m.img)} alt="" width="64" height="64" />
                <span><b>{m.name}</b><span>{m.look}</span></span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Help() {
  return (
    <section className="help-block" id="help" aria-labelledby="help-h">
      <div className="help-inner wrap">
        <div className="help-intro">
          <p className="eyebrow">Customer care</p>
          <h2 className="title" id="help-h">Need a <b>hand?</b></h2>
          <p>Everything about getting your order, sending something back, and the questions people ask us most.</p>
          <p className="help-contact">Still stuck? Message us on <a href="https://www.instagram.com/nvrsttl.store/">Instagram</a>.</p>
        </div>
        <ul className="help-list">
          <li><a href="#help"><span className="help-name">Shipping</span><span className="help-desc">Processing, delivery and charges</span><span className="help-arrow" aria-hidden="true">→</span></a></li>
          <li><a href="#help"><span className="help-name">Returns &amp; exchanges</span><span className="help-desc">Report an issue within 48 hours of delivery</span><span className="help-arrow" aria-hidden="true">→</span></a></li>
          <li><a href="#help"><span className="help-name">FAQs</span><span className="help-desc">The questions we get most</span><span className="help-arrow" aria-hidden="true">→</span></a></li>
        </ul>
      </div>
    </section>
  );
}

export default function NvrsttlHome() {
  return (
    <>
      <Header />
      <main>
        <TeeCarousel />
        <Hero />

        <section className="sec wrap" id="after-hours" aria-labelledby="ah-h">
          <div className="feature">
            <img src={ASSET('img/after-hours-flatlay.jpg')} width="1000" height="1333" alt="The After Hours washed black cap with the embroidered NVRSTTL wordmark, beside its hang tags" />
            <div className="feature-copy">
              <p className="eyebrow">The main piece</p>
              <h2 className="title" id="ah-h">After <b>Hours</b></h2>
              <p>A washed black cap with the NVRSTTL wordmark embroidered in tone on the side and the cross on the front. Soft, worn-in and one size.</p>
              <blockquote className="tag-quote">make peace with the parts of you they never understood</blockquote>
              <p className="small">From the After Hours hang tag.</p>
              <div className="row">
                <Link className="btn" href="/nvrsttl/shop?cat=headwear">Shop After Hours</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="story" id="about" aria-labelledby="about-h">
          <div className="story-grid wrap">
            <img src={ASSET('img/story.jpg')} width="643" height="705" alt="Folded washed black NVRSTTL tee with embroidered wordmark, beside thread and scissors on a dark workbench" />
            <div className="story-copy">
              <h2 className="title" id="about-h">The story <b>so far</b></h2>
              <div className="rule" aria-hidden="true" />
              <p><b>NVRSTTL started with a feeling:</b> knowing what you want to wear, and rarely finding it.</p>
              <p>That feeling became our starting point. Washed textures. Deliberate silhouettes. A darker edge, with details that reward a closer look.</p>
              <p><b>Never Settle</b> is a standard we hold ourselves to. Every release is a chance to sharpen our point of view.</p>
            </div>
          </div>
        </section>

        <Crew />

        <section className="sec wrap" id="vlog" aria-labelledby="vlog-h">
          <div className="sec-head"><p className="eyebrow">From Instagram</p><h2 className="title" id="vlog-h">The <b>vlog</b></h2></div>
          <div className="vlog">
            <a href="https://www.instagram.com/nvrsttl.store/" target="_blank" rel="noopener noreferrer">
              <img src={ASSET('img/vlog-3.jpg')} width="720" height="1120" alt="Reel cover: NVRSTTL crew member" />
              <span className="play" aria-hidden="true">▶</span>
              <span className="meta"><span>Watch on Instagram ↗</span></span>
            </a>
            <a href="https://www.instagram.com/nvrsttl.store/" target="_blank" rel="noopener noreferrer">
              <img src={ASSET('img/vlog-2.jpg')} width="720" height="1120" alt="Reel cover: NVRSTTL crew member" />
              <span className="play" aria-hidden="true">▶</span>
              <span className="meta"><span>Watch on Instagram ↗</span></span>
            </a>
          </div>
        </section>

        <section className="sec wrap" style={{ paddingTop: 0 }} aria-labelledby="inner-h">
          <InnerCircle />
        </section>

        <Help />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}

function InnerCircle() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const submit = (e) => {
    e.preventDefault();
    setNote(/^\S+@\S+\.\S+$/.test(email) ? 'Thanks. You are on the list.' : 'Enter a valid email address.');
  };
  return (
    <div className="inner">
      <p className="eyebrow">Members</p>
      <h2 className="title" id="inner-h">The inner <b>circle</b></h2>
      <p>Get a closer look at NVRSTTL. Upcoming drops, behind the scenes, and a say in what comes next.</p>
      <form onSubmit={submit} noValidate>
        <label className="visually-hidden" htmlFor="email">Email</label>
        <input id="email" type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">Subscribe</button>
      </form>
      <p className="form-note" role="status" aria-live="polite">{note}</p>
    </div>
  );
}
