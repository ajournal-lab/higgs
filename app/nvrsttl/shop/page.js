'use client';

import { useEffect, useMemo, useState } from 'react';
import { ASSET, CartDrawer, Footer, Header, PRODUCTS, useCart } from '../NvrsttlSite';

const rs = (n) => `Rs. ${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function ProductCard({ p }) {
  const cart = useCart();
  const [size, setSize] = useState(null);
  const available = p.sizes.filter((s) => !p.soldOut.includes(s));
  const chosen = size || (available.length === 1 ? available[0] : null);
  return (
    <article className="card">
      <div className="pic">
        <img src={ASSET(p.img)} alt={p.alt} width="400" height="500" />
        {p.was && <span className="tag">Sale</span>}
      </div>
      <h3>{p.name}</h3>
      <p className="price">
        {p.was && <s>{rs(p.was)}</s>}
        {rs(p.price)}
      </p>
      <fieldset className="sizes" style={{ border: 0, padding: 0 }}>
        <legend className="visually-hidden">Size</legend>
        {p.sizes.map((s) => {
          const out = p.soldOut.includes(s);
          return (
            <label key={s}>
              <input type="radio" name={p.id} value={s} disabled={out} checked={chosen === s} onChange={() => setSize(s)} />
              <span>{s}</span>
            </label>
          );
        })}
      </fieldset>
      <button className="btn" type="button" disabled={!chosen} onClick={() => cart.add(p.id, chosen)}>
        {chosen ? 'Add to cart' : 'Choose a size'}
      </button>
    </article>
  );
}

function ShopInner() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('cat');
    if (cat) setFilter(cat);
  }, []);

  const list = useMemo(
    () => PRODUCTS.filter((p) => (filter === 'all' || p.cats.includes(filter)) && p.name.toLowerCase().includes(query.trim().toLowerCase())),
    [filter, query],
  );

  return (
    <>
      <section className="page-head wrap" aria-labelledby="shop-h">
        <p className="eyebrow">Our collection</p>
        <h1 className="title" id="shop-h">See what&apos;s <b>new today</b></h1>
        <div className="tabs" role="group" aria-label="Filter by category">
          {[['all', 'All'], ['sale', 'Sale'], ['headwear', 'Headwear'], ['tops', 'Tops']].map(([key, label]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>
        <div className="shop-search">
          <label className="visually-hidden" htmlFor="search">Search the collection</label>
          <input id="search" type="search" placeholder="Search the collection" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </section>
      <section className="wrap" aria-label="Products">
        <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        {list.length === 0 && <p className="empty show" role="status">Nothing matches. Clear the filters or try another word.</p>}
      </section>
    </>
  );
}

export default function ShopPage() {
  return (
    <>
      <Header />
      <main>
        <ShopInner />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
