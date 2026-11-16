'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { ASSET, CartDrawer, Footer, Header, PRODUCTS, useCart } from '../NvrsttlSite';

/* 3D product view. Loads the product's .glb model when it exists in public/nvrsttl/models/;
   otherwise shows a simple stand-in shape so the viewer still works. Drag to rotate, scroll to zoom. */
const GLB = { 'after-hours': ASSET('models/after-hours.glb') };

function buildStandIn(THREE) {
  const group = new THREE.Group();
  const cloth = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
  const crown = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), cloth);
  crown.scale.set(1, 0.72, 1);
  group.add(crown);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.06, 48, 1, false, -Math.PI / 2, Math.PI), cloth);
  brim.position.set(0, -0.1, 0.55);
  brim.rotation.x = -0.25;
  group.add(brim);
  group.position.y = -0.2;
  return group;
}

function Viewer({ productId }) {
  const mount = useRef(null);
  const [status, setStatus] = useState('Loading the 3D viewer…');
  const [usingStandIn, setUsingStandIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let cleanup = () => {};

    const start = () => {
      const THREE = window.THREE;
      if (!THREE || !THREE.GLTFLoader || !THREE.OrbitControls) return false;
      const el = mount.current;
      const w = el.clientWidth || 600, h = el.clientHeight || 500;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
      camera.position.set(0, 0.6, 4.2);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(3, 4, 5);
      scene.add(key);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;

      const holder = new THREE.Group();
      scene.add(holder);

      const fit = (obj) => {
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        obj.position.sub(center);
        const scale = 2.2 / Math.max(size.x, size.y, size.z || 1);
        obj.scale.multiplyScalar(scale);
      };

      const url = GLB[productId];
      const stand = () => {
        if (cancelled) return;
        const obj = buildStandIn(THREE);
        holder.add(obj);
        fit(holder);
        setUsingStandIn(true);
        setStatus('Stand-in shape. Add a real model file to show the product.');
      };
      const loader = new THREE.GLTFLoader();
      if (url) {
        loader.load(
          url,
          (gltf) => {
            if (cancelled) return;
            holder.add(gltf.scene);
            fit(holder);
            setStatus('Drag to rotate. Scroll to zoom.');
          },
          undefined,
          () => stand(),
        );
      } else {
        stand();
      }

      const onResize = () => {
        const nw = el.clientWidth || w, nh = el.clientHeight || h;
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      };
      window.addEventListener('resize', onResize);

      const tick = () => {
        if (cancelled) return;
        holder.rotation.y += 0.002;
        controls.update();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      cleanup = () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(raf);
        controls.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      };
      return true;
    };

    let waited = 0;
    const wait = setInterval(() => {
      waited += 300;
      if (start()) clearInterval(wait);
      else if (waited > 15000) {
        clearInterval(wait);
        setStatus("The 3D viewer couldn't load. Check your connection and reload.");
      }
    }, 300);

    return () => {
      cancelled = true;
      clearInterval(wait);
      cleanup();
    };
  }, [productId]);

  return (
    <div className="stage" style={{ aspectRatio: '1 / 1', position: 'relative' }}>
      <div ref={mount} style={{ position: 'absolute', inset: 0 }} />
      <p className="hint">{status}</p>
    </div>
  );
}

export default function ThreeDPage() {
  const cart = useCart();
  const [id, setId] = useState('after-hours');
  const p = PRODUCTS.find((x) => x.id === id);
  const available = p.sizes.filter((s) => !p.soldOut.includes(s));
  const [size, setSize] = useState(available[0]);

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js" strategy="afterInteractive" />
      <Header />
      <main className="sec wrap">
        <div className="tryon">
          <Viewer productId={id} />
          <section className="try-panel" aria-labelledby="3d-h">
            <p className="eyebrow">In 3D</p>
            <h1 className="title" id="3d-h">{p.name}</h1>
            <p className="price">{p.was && <s>Rs. {p.was.toLocaleString('en-IN')}.00</s>} Rs. {p.price.toLocaleString('en-IN')}.00</p>
            <div className="try-step">
              {/* only the cap has a 3D model so far; add tees once their .glb files exist */}
              <button type="button" className="btn ghost" aria-pressed="true">After Hours</button>
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
            <p className="small">Drag to turn the product. Scroll to zoom. The 3D view is a preview of the piece, not a photo.</p>
            <Link className="btn ghost" href="/nvrsttl/tryon">Try it on you</Link>
          </section>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
