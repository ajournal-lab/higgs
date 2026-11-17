# Gemini brief: OCTABOOT Drop 01 site

Paste everything below the line into Gemini (gemini.google.com or AI Studio, a Pro model if you have it).
Send the HTML it returns back to Claude to wire in the 3D garment videos.

---

You are a senior creative front-end developer who builds award-winning, cinematic fashion e-commerce landing pages. Write one complete, self-contained HTML file. Output only the HTML, starting with <!DOCTYPE html>.

Build a single-file HTML landing page for a dark luxury streetwear label called OCTABOOT, for its first release, DROP 01 (six pieces: four tees and two polos).

REFERENCE (a screen recording of a site I love; recreate its feel and mechanics, do NOT copy its words):
- Near-black, cinematic, moody. The page is a scroll-driven film: a full-viewport sticky stage that changes scene as you scroll, like chapters.
- Opening: a lone garment floats in the dark under a single cold white overhead spotlight beam, with a faint reflective wet floor and drifting dust motes. Big left-aligned elegant serif headline (thin, high-contrast serif like Cormorant Garamond), 2 short lines.
- A small italic serif caption sits on the RIGHT edge of the screen, two short lines, low contrast, like a film subtitle. Each chapter has its own caption.
- Middle chapter: a cyberpunk night street mood: vertical neon signs (red and cyan glows) on the sides, slanted rain streaks, wet reflections, light fog.
- One chapter shows a glowing hexagon logo mark (outline hexagon inside a hexagon) with light streaks.
- One chapter uses glitchy, scan-lined, horizontally sliced display typography (RGB-split, flickering) for a big word, plus a small mono list of items on the right.
- Climax: several garments lined up in a row on a dark stage, the centre one larger and spotlit, side ones dimmer, and a centred glassy pill button 'ENTER THE DROP' with a soft white glow.
- Very thin top navigation: small hexagon logo + wordmark left, tiny mono uppercase links right (SHOP, COLLECTION, ARCHIVE, BAG (0)).
- Typography: thin serif display + wide-tracked uppercase monospace labels (JetBrains Mono) + Inter for body. Palette: #050505 black, bone #E8E6E1 text, silver #9a9893 secondary, cold white light, accents red #ff2a4b and cyan #00e5ff used only for neon.

THE GARMENTS (use exactly this data; each has a transparent-background WebM of the garment spinning a full 360 degrees once, about 4 seconds, plus a transparent PNG poster of its first frame):

```js
const GARMENTS = [
 { id:'lv-tee', name:'Black Print Tee', kind:'Tee', detail:'Black cotton tee with a large yellow, ivory and grey bubble print across the back.', price:185 },
 { id:'olive-tee', name:'Olive Jacquard Tee', kind:'Tee', detail:'Olive tee with a raised all-over arrow-chain jacquard weave.', price:195 },
 { id:'black-polo', name:'Black Polo', kind:'Polo', detail:'Black polo with a soft folded collar, two-button placket and a small chest logo.', price:220 },
 { id:'navy-zip-polo', name:'Navy Zip Polo', kind:'Polo', detail:'Navy zip polo with white raglan sleeves and collar, a short zip and a vintage arched print.', price:235 },
 { id:'boss-back-tee', name:'Black Back-Print Tee', kind:'Tee', detail:'Black tee with a circular wordmark print across the back.', price:210 },
 { id:'boss-front-tee', name:'Black Logo Tee', kind:'Tee', detail:'Black tee with a striped block-letter logo across the chest.', price:200 },
];
```

Video path: `media/${id}.webm`, poster path: `media/${id}.png`. Prices are placeholders; show them with a $ sign.

MECHANICS:
1. Sticky stage section about 700vh tall. Scroll progress 0..1 maps to 6 garment chapters plus an intro and the lineup finale. Smooth the progress with a lerp in a requestAnimationFrame loop.
2. Exactly one `<video muted playsinline preload>` per garment, absolutely stacked in the centre of the stage (object-fit: contain, around 46vmin wide), crossfading. When a garment's chapter becomes active, set currentTime = 0 and play() it ONCE (no loop) so the viewer sees the garment spin 360 degrees as it arrives; pause the others. Catch play() promise rejections. Add a subtle CSS drop-shadow and a slow floating motion. Mouse movement adds a slight 3D tilt (perspective).
3. Atmosphere on a full-screen `<canvas>` behind the garment: overhead volumetric spotlight cone, floor glow, dust particles; rain + neon side glows fade in only during the neon chapter; a hexagon mark drawn with glowing strokes during its chapter.
4. Each chapter: left big serif headline (write your own ORIGINAL two-line headlines, 2-4 words each, evocative, no cliches about 'void', 'shadow', 'neon rain', 'mist', 'forged', 'the mark remains'), a mono label like 'PIECE 02 / 06', the garment name and price, and the right-edge italic caption (your own short original lines). Chapter text fades and slides between chapters.
5. Glitch chapter: the big word is 'DROP 01' with layered RGB-split slices; the right-side mono list is the six garment names numbered.
6. Finale: all six posters (img tags using the poster paths) in a row with perspective, centre one bigger, plus the 'ENTER THE DROP' button that opens a right-side bag drawer.
7. Bottom HUD on the stage: chapter pills (one per garment, clickable to scroll to that chapter), thin progress bar, scroll percentage.
8. Below the stage: a lineup grid of the six garments (poster images on dark cards, name, detail, price, S/M/L/XL size buttons, ADD TO BAG), a short manifesto block with an email field (preventDefault on submit, show 'Sign-up opens with the store.'), and a minimal footer.
9. Bag drawer: selected garment preview, size picker, add to bag, item list with remove, subtotal, and a CHECKOUT button that shows 'Checkout is not connected yet.'

HARD REQUIREMENTS:
- One self-contained file: inline `<style>` and `<script>`. NO Tailwind, NO frameworks, NO external JS. Only external resource allowed: one Google Fonts stylesheet link for Cormorant Garamond, Inter and JetBrains Mono.
- Do NOT set overflow:hidden or overflow-x:hidden on html or body (it breaks position:sticky). Use overflow-x: clip if needed.
- Responsive: at 390px wide, chapter text must sit ABOVE the garment (not over it), hide long descriptions, keep everything inside the screen with no horizontal scroll; HUD pills scroll horizontally inside their own container.
- Respect prefers-reduced-motion (no autoplay spin, no particles; still show posters).
- Accessible: real buttons, labels on inputs, visible focus outlines, alt text.
- No placeholder image URLs, no lorem ipsum, no invented facts (no fabric weights, no limited-edition counts, no cities, no shipping claims).
- The page must look finished and premium at rest on first load.
