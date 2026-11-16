'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export const ASSET = (p) => `/nvrsttl/${p}`;

export const PRODUCTS = [
  { id: 'after-hours', name: 'After Hours', cats: ['headwear', 'sale'], price: 999, was: 1199, img: 'img/shop-after-hours.jpg', alt: 'Woman wearing the After Hours washed black cap with the cross and NVRSTTL wordmark', sizes: ['One size'], soldOut: [] },
  { id: 'tee-white', name: 'Heavyweight Tee, White', cats: ['tops'], price: 1499, img: 'img/shop-tee-white.jpg', alt: 'Man in a white crew-neck tee', sizes: ['S', 'M', 'L', 'XL'], soldOut: ['XL'] },
  { id: 'tee-black', name: 'Heavyweight Tee, Black', cats: ['tops'], price: 1499, img: 'img/shop-tee-black.jpg', alt: 'Man in a black crew-neck tee', sizes: ['S', 'M', 'L', 'XL'], soldOut: [] },
  { id: 'tee-washed', name: 'Washed Black Tee', cats: ['tops', 'sale'], price: 1299, was: 1599, img: 'img/shop-tee-washed.jpg', alt: 'Man in a washed black tee', sizes: ['S', 'M', 'L', 'XL'], soldOut: ['S'] },
  { id: 'shirt-black', name: 'Black Overshirt', cats: ['tops'], price: 2499, img: 'img/shop-shirt-black.jpg', alt: 'Man in a black button-up overshirt', sizes: ['S', 'M', 'L'], soldOut: [] },
];

export const CREW = [
  { name: 'Studio', look: 'After Hours cap, washed zip hoodie', img: 'img/face-1.jpg', video: 'img/crew-1', poster: 'img/crew-1.jpg' },
  { name: 'At home', look: 'Woman in the After Hours cap', img: 'img/face-2.jpg' },
  { name: 'Downtown', look: 'Woman in the After Hours cap', img: 'img/face-3.jpg' },
  { name: 'Overshirt', look: 'Man in a black overshirt', img: 'img/face-4.jpg' },
];

const CART_KEY = 'nvrsttl-cart';
const rs = (n) => `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (Array.isArray(saved)) setLines(saved);
    } catch (e) { /* storage unavailable: start empty */ }
  }, []);

  const save = (next) => {
    setLines(next);
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
  };

  const api = useMemo(() => {
    const count = lines.reduce((s, l) => s + l.qty, 0);
    const total = lines.reduce((s, l) => s + (PRODUCTS.find((p) => p.id === l.id)?.price || 0) * l.qty, 0);
    return {
      lines,
      count,
      total,
      open,
      setOpen,
      add(id, size) {
        const i = lines.findIndex((l) => l.id === id && l.size === size);
        const next = i >= 0 ? lines.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l)) : [...lines, { id, size, qty: 1 }];
        save(next);
        setOpen(true);
      },
      change(i, d) {
        save(lines.map((l, j) => (j === i ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0));
      },
      remove(i) { save(lines.filter((_, j) => j !== i)); },
    };
  }, [lines, open]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);

export function Header() {
  const cart = useCart();
  const [menu, setMenu] = useState(false);
  return (
    <>
      <div className="strip" aria-hidden="true">
        <div className="strip-track">
          {[0, 1, 2, 3].map((i) => (
            <span key={i}>Get 10% off your first order with code FIRST10 · Substance over spectacle · Never settle</span>
          ))}
        </div>
      </div>
      <header className={`top wrap${menu ? ' open' : ''}`}>
        <nav aria-label="Main" id="top-nav">
          <ul>
            <li><Link href="/nvrsttl/shop">Shop</Link></li>
            <li><Link href="/nvrsttl/shop?cat=headwear">Headwear</Link></li>
            <li><Link href="/nvrsttl/shop?cat=sale">Sale</Link></li>
            <li><Link href="/nvrsttl#about">About</Link></li>
            <li><Link href="/nvrsttl#vlog">Vlog</Link></li>
            <li><Link href="/nvrsttl#help">Help</Link></li>
          </ul>
        </nav>
        <Link className="logo" href="/nvrsttl" aria-label="NVRSTTL home"><b>NVRSTTL</b><small>NEVER SETTLE</small></Link>
        <div className="tools">
          <Link className="icon-btn" href="/nvrsttl/shop" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          </Link>
          <button className="icon-btn cart-btn" type="button" onClick={() => cart.setOpen(true)} aria-label={`Open cart, ${cart.count} items`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 8h14l-1 13H6z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>
            <span className="count">{cart.count}</span>
          </button>
          <button className="icon-btn menu-btn" type="button" aria-expanded={menu} aria-controls="top-nav" onClick={() => setMenu(!menu)}>Menu</button>
        </div>
      </header>
    </>
  );
}

export function CartDrawer() {
  const cart = useCart();
  return (
    <>
      <div className={`scrim${cart.open ? ' open' : ''}`} onClick={() => cart.setOpen(false)} />
      <aside className={`drawer${cart.open ? ' open' : ''}`} aria-label="Cart" aria-hidden={!cart.open}>
        <header>
          <h2>Your cart</h2>
          <button className="close" type="button" onClick={() => cart.setOpen(false)}>Close</button>
        </header>
        <ul className="lines">
          {cart.lines.map((l, i) => {
            const p = PRODUCTS.find((x) => x.id === l.id);
            return (
              <li key={`${l.id}-${l.size}`}>
                <img src={ASSET(p.img)} alt="" />
                <div>
                  <div className="name">{p.name}</div>
                  <div className="sub">Size {l.size} · {rs(p.price)}</div>
                  <div className="qty">
                    <button type="button" onClick={() => cart.change(i, -1)} aria-label="Decrease">−</button>
                    <span>{l.qty}</span>
                    <button type="button" onClick={() => cart.change(i, 1)} aria-label="Increase">+</button>
                  </div>
                  <button className="remove" type="button" onClick={() => cart.remove(i)}>Remove</button>
                </div>
              </li>
            );
          })}
        </ul>
        {cart.lines.length === 0 && <p className="empty-cart">Your cart is empty.</p>}
        <footer>
          <div className="total"><span>Subtotal</span><span>{rs(cart.total)}</span></div>
          <p className="note">Shipping and taxes are calculated at checkout.</p>
          <a className="btn" href="#checkout" aria-disabled={cart.lines.length === 0}>Checkout</a>
        </footer>
      </aside>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site wrap">
      <div className="foot-grid">
        <div>
          <Link className="logo" href="/nvrsttl" style={{ textAlign: 'left', display: 'inline-block' }}><b>NVRSTTL</b><small>NEVER SETTLE</small></Link>
          <p>Substance over spectacle. Washed textures, deliberate silhouettes and a darker edge.</p>
        </div>
        <div>
          <h3>Customer care</h3>
          <ul>
            <li><Link href="/nvrsttl#help">FAQs</Link></li>
            <li><Link href="/nvrsttl#help">Returns &amp; Exchanges</Link></li>
            <li><Link href="/nvrsttl#help">Shipping Policy</Link></li>
          </ul>
        </div>
        <div>
          <h3>Follow</h3>
          <ul>
            <li><a href="https://www.instagram.com/nvrsttl.store/">Instagram</a></li>
            <li><a href="https://www.facebook.com/share/1d7ZQcdz7u/">Facebook</a></li>
          </ul>
        </div>
      </div>
      <div className="legal"><span>© 2026 NVRSTTL. All rights reserved.</span><span>Products other than After Hours are samples.</span></div>
      <p className="wordmark" aria-hidden="true">NVRSTTL</p>
    </footer>
  );
}
