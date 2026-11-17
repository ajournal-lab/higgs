import re, sys
src = open(sys.argv[1]).read(); out_path = sys.argv[2]
s = src
def rep(a, b, count=1):
    global s
    assert a in s, 'missing: ' + a[:80]
    s = s.replace(a, b, count)
def rep_between(start, end, new):
    global s
    i0 = s.index(start); i1 = s.index(end, i0)
    s = s[:i0] + new + s[i1:]

rep('<title>OCTABOOT — FORGED | Collection 01</title>', '<title>OCTABOOT Drop 01</title>')
# 'overflow-x: hidden' on both html and body makes body a scroll box, so the sticky stage never sticks
rep("      font-family: 'Inter', sans-serif;\n      overflow-x: hidden;", "      font-family: 'Inter', sans-serif;\n      overflow-x: clip;")
rep("      object-fit: cover;\n      object-position: center;\n      transition: opacity 0.45s", "      object-fit: contain;\n      object-position: center;\n      padding: 8% 4% 12%;\n      filter: brightness(1.35) contrast(1.05);\n      transition: opacity 0.45s")

# stage: one transparent turntable video per garment, built from GARMENTS
rep_between('          <!-- Pre-mounted 100% Opacity Crossfading Garment Layers', '          <!-- Subtle Rim Highlight Sheen',
            '          <!-- One transparent 360° turntable per garment; the active one plays its turn -->\n          <div id="stage-layers" class="absolute inset-0"></div>\n\n')
# chapter panels and pills are generated from GARMENTS too
rep_between('          <!-- STAGE 1 (0% - 20%): Left-Aligned Headline -->', '        </div>\n\n        <!-- Bottom Controls',
            '          <div id="story-wrap" class="absolute inset-0"></div>\n\n')
rep_between('          <div class="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 sm:pb-0">', '          <!-- Center Scroll Prompt',
            '          <div id="step-pills" class="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 sm:pb-0"></div>\n\n')

# copy that described the old placeholder garments or came from the reference reel
rep('            The Five Silhouettes.', '            Six Pieces.')
rep('          Engineered across heavyweight combed cotton jersey and textured motorsport piqué. Select a size directly on any silhouette or inspect it inside the 3D hero stage.',
    '          Four tees and two polos. Pick a size on any piece, or watch it turn on the stage above.')
rep('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6')
rep('        OCTABOOT ATELIER // TOKYO — MILAN', '        OCTABOOT // DROP 01')
rep('          Forged once.<br/>\n          <span class="italic text-silver">Worn forever.</span>', '          Made to stay.<br/>\n          <span class="italic text-silver">Worn on repeat.</span>')
rep('          Rejecting seasonal disposability, OCTABOOT constructs heavyweight shirting and performance piqué polos engineered for nocturnal environments. Every graphic is cured with high-opacity plastisol, studded micro-hardware, and enzyme-washed in small batches.',
    '          OCTABOOT picks pieces that outlast a season: heavy tees, clean polos and prints that hold their own. Drop 01 is six of them, and every one turns a full 360° on the stage so you can see the back before you buy.')
rep('            ACCESS GRANTED — YOU ARE REGISTERED FOR ENCRYPTED DROP DISPATCHES.', "            NOTED. THIS PREVIEW DOESN'T SAVE EMAILS YET.")
rep('grid grid-cols-5 gap-2.5" id="manifesto-thumbs"', 'grid grid-cols-3 sm:grid-cols-6 gap-2.5" id="manifesto-thumbs"')
rep('grid grid-cols-5 gap-2" id="colorway-buttons"', 'grid grid-cols-3 gap-2" id="colorway-buttons"')
rep('          <span>SELECT ARCHIVE PIECE (05)</span>\n          <span class="text-emerald-400">IN STOCK — SERIALIZED</span>', '          <span>SELECT PIECE (06)</span>\n          <span class="text-silver/70">SIZES S – XL</span>')
rep('        PROCEED TO ENCRYPTED CHECKOUT', '        CHECKOUT')
rep('        ORDER RESERVED — ALLOCATING SERIAL NUMBER...', "        CHECKOUT ISN'T CONNECTED YET.")
specs = [
 ('Six pieces, two shapes', 'Four crew-neck tees and two polos: a black polo with a folded collar and two-button placket, and a navy zip polo with white raglan sleeves.'),
 ('Prints and texture', 'A large back print, a circular back wordmark, a striped chest logo, a small chest logo, a vintage arched print and an all-over jacquard weave on the olive tee.'),
 ('Sizes S to XL', 'Every piece comes in S, M, L and XL. Pick a size on its card or in the bag.'),
 ('See every side', 'Each piece on the stage is a full 3D turn, so you can check the back and sides before you choose.'),
]
blocks = re.findall(r'<span class="font-medium text-sm sm:text-base text-white group-hover:text-chrome transition-colors">.*?</span>.*?<p class="pt-3 pl-8 text-xs sm:text-sm text-silver leading-relaxed">\s*.*?\s*</p>', s, re.S)
assert len(blocks) == 4, len(blocks)
for blk, (t, d) in zip(blocks, specs):
    nb = re.sub(r'(transition-colors">).*?(</span>)', lambda m: m.group(1) + t + m.group(2), blk, count=1, flags=re.S)
    nb = re.sub(r'(leading-relaxed">)\s*.*?\s*(</p>)', lambda m: m.group(1) + '\n                    ' + d + '\n                  ' + m.group(2), nb, count=1, flags=re.S)
    s = s.replace(blk, nb, 1)
rep('<h3 class="font-serif text-2xl sm:text-3xl text-bone mt-1">Fabric &amp; Print Architecture</h3>', '<h3 class="font-serif text-2xl sm:text-3xl text-bone mt-1">What\'s in Drop 01</h3>')
rep('<div class="text-xs text-white mt-1">BOXY / RELAXED DROP</div>', '<div class="text-xs text-white mt-1">RELAXED</div>')
rep('<div class="text-[9px] text-silver uppercase tracking-widest">COLLAR RIB</div>\n              <div class="text-xs text-white mt-1">1X1 HIGH-TENSION KNIT</div>', '<div class="text-[9px] text-silver uppercase tracking-widest">NECK</div>\n              <div class="text-xs text-white mt-1">CREW / POLO</div>')
rep('<div class="text-[9px] text-silver uppercase tracking-widest">DISPATCH</div>\n              <div class="text-xs text-emerald-400 mt-1">READY TO SHIP</div>', '<div class="text-[9px] text-silver uppercase tracking-widest">SIZES</div>\n              <div class="text-xs text-white mt-1">S – XL</div>')
rep('src="image_56c1e7.png"\n              alt="Active Garment Detail"', 'src="media/lv-tee.png"\n              alt="Active Garment Detail"')
rep('src="image_56c1e7.png"\n            alt="Selected Garment"', 'src="media/lv-tee.png"\n            alt="Selected Garment"')
for a, b in (('<span id="frame-sku">OB-01 // 340 GSM</span>', '<span id="frame-sku">OB-01 // TEE</span>'), ('<span id="manifesto-detail-sku">OB-01 // 340 GSM</span>', '<span id="manifesto-detail-sku">OB-01 // TEE</span>'),
             ('Black Orbit Graphic Tee\n            </h3>', 'Black Print Tee\n            </h3>'), ('<span id="frame-title" class="text-bone truncate">BLACK ORBIT GRAPHIC TEE</span>', '<span id="frame-title" class="text-bone truncate">BLACK PRINT TEE</span>'), ('ml-2">01 / 05</span>', 'ml-2">01 / 06</span>'),
             ('<span id="hud-stage-code">SEQ // 001 — BLACK ORBIT GRAPHIC TEE</span>', '<span id="hud-stage-code">SEQ // 001 — BLACK PRINT TEE</span>')):
    rep(a, b)
s = re.sub(r'Bold yellow, ivory, and smoked-grey orbital graphic screenprinted onto 340 GSM matte black combed cotton\.', 'Black cotton tee with a large yellow, ivory and grey bubble print across the back.', s)
rep('<h3 id="drawer-garment-heading" class="font-serif text-2xl sm:text-3xl text-white mt-0.5">NOIR ORB TEE</h3>', '<h3 id="drawer-garment-heading" class="font-serif text-2xl sm:text-3xl text-white mt-0.5">BLACK PRINT TEE</h3>')
rep('<span id="drawer-color-name" class="text-bone">BLACK ORBIT GRAPHIC TEE</span>', '<span id="drawer-color-name" class="text-bone">BLACK PRINT TEE</span>')
rep('<span id="hotspot-1-text">340 GSM MATTE BLACK COTTON</span>', '<span id="hotspot-1-text">BLACK COTTON JERSEY</span>')
rep('<span id="hotspot-2-text">HIGH-DENSITY ORBIT PRINT</span>', '<span id="hotspot-2-text">LARGE BACK PRINT</span>')

# the catalogue
G = '''    const G = (id, shortName, name, kind, detail, hotspot1, hotspot2, headline, price) => ({
      id, shortName, name, sku: '', kind, detail, hotspot1, hotspot2, headline, price,
      img: `media/${id}.png`, video: `media/${id}.webm`
    });
    // Prices are placeholders: set the real ones here.
    const GARMENTS = [
      G('lv-tee', 'PRINT TEE', 'BLACK PRINT TEE', 'TEE', 'Black cotton tee with a large yellow, ivory and grey bubble print across the back.', 'BLACK COTTON JERSEY', 'LARGE BACK PRINT', 'Built<br/>in black.', 185),
      G('olive-tee', 'JACQUARD', 'OLIVE JACQUARD TEE', 'TEE', 'Olive tee with a raised all-over arrow-chain jacquard weave.', 'ALL-OVER JACQUARD WEAVE', 'RELAXED CREW NECK', 'Woven<br/>in olive.', 195),
      G('black-polo', 'POLO', 'BLACK POLO', 'POLO', 'Black polo with a soft folded collar, two-button placket and a small chest logo.', 'FOLDED COLLAR', 'TWO-BUTTON PLACKET', 'Quiet<br/>collar.', 220),
      G('navy-zip-polo', 'ZIP POLO', 'NAVY ZIP POLO', 'POLO', 'Navy zip polo with white raglan sleeves and collar, a short zip and a vintage arched print.', 'WHITE RAGLAN SLEEVES', 'VINTAGE ARCHED PRINT', 'Old school,<br/>zipped.', 235),
      G('boss-back-tee', 'BACK PRINT', 'BLACK BACK-PRINT TEE', 'TEE', 'Black tee with a circular wordmark print across the back.', 'BLACK COTTON JERSEY', 'CIRCULAR BACK PRINT', 'Read<br/>the back.', 210),
      G('boss-front-tee', 'LOGO TEE', 'BLACK LOGO TEE', 'TEE', 'Black tee with a striped block-letter logo across the chest.', 'BLACK COTTON JERSEY', 'STRIPED CHEST LOGO', 'Front and<br/>centre.', 200),
    ];
    const NG = GARMENTS.length;
    const pad2 = (n) => String(n).padStart(2, '0');
    GARMENTS.forEach((g, i) => { g.sku = `OB-${pad2(i + 1)} // ${g.kind}`; g.gsm = g.kind; g.scrollStop = (i + 0.5) / NG; });

    // build the stage layers, chapter panels and pills from the catalogue
    document.getElementById('stage-layers').innerHTML = GARMENTS.map((g, i) => `
      <video id="stage-img-${i}" class="stage-garment-layer ${i === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}" muted playsinline preload="${i < 2 ? 'auto' : 'metadata'}" poster="${g.img}" aria-label="${g.name} turning 360 degrees">
        <source src="${g.video}" type="video/webm">
      </video>`).join('');
    document.getElementById('story-wrap').innerHTML = GARMENTS.map((g, i) => {
      const last = i === NG - 1, left = i === 0;
      const panel = `
        <div class="${left ? '' : 'ml-auto text-right'} max-w-xs sm:max-w-[290px] bg-obsidian/70 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none px-3.5 py-2.5 sm:p-3.5 lg:p-0 rounded-xl border border-white/10 lg:border-none">
          <div class="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.26em] ${i === 3 ? 'text-ember' : 'text-gold'} uppercase mb-1.5 sm:mb-3">
            ${left ? '<span class="w-4 h-[1px] bg-gold/70"></span>' : ''}<span>PIECE ${pad2(i + 1)} / ${pad2(NG)}${left ? ' // DROP 01' : ''}</span>${left ? '' : `<span class="w-4 h-[1px] ${i === 3 ? 'bg-ember/70' : 'bg-gold/70'}"></span>`}
          </div>
          <${left ? 'h1' : 'h2'} class="font-serif text-3xl ${left ? 'sm:text-6xl leading-[0.96]' : 'sm:text-5xl leading-[1.02]'} font-normal tracking-[-0.02em] text-bone sm:mb-4">${g.headline}</${left ? 'h1' : 'h2'}>
          <p class="hidden sm:block text-xs sm:text-sm text-silver leading-relaxed font-light">${g.detail}</p>
        </div>`;
      const inner = panel;
      return `<div class="absolute inset-x-0 top-0 lg:top-1/2 lg:-translate-y-1/2"><div id="story-${i}" class="story-panel ${i === 0 ? 'story-active' : 'story-hidden'}">${inner}</div></div>`;
    }).join('');
    const ctaRow = document.createElement('div');
    ctaRow.className = 'absolute left-0 right-0 bottom-[118px] sm:bottom-[92px] z-30 flex justify-center pointer-events-none';
    ctaRow.innerHTML = `<div id="drop-cta-panel" class="story-panel story-hidden pointer-events-auto flex flex-col items-center">
        <button onclick="openDropDrawer()" class="drop-cta px-8 py-3.5 rounded-full font-mono text-xs tracking-[0.26em] uppercase text-bone cursor-pointer">ENTER THE DROP</button>
        <span class="mt-2.5 font-mono text-[10px] tracking-[0.22em] text-bone/90 uppercase bg-obsidian/80 px-3 py-1 rounded-full border border-white/10">${pad2(NG)} PIECES // DROP 01</span>
      </div>`;
    document.getElementById('sticky-stage').appendChild(ctaRow);
    document.getElementById('step-pills').innerHTML = GARMENTS.map((g, i) => `
      <button onclick="selectShowcaseGarment(${i}, true)" data-step="${i}" class="step-pill px-2.5 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase transition-all ${i === 0 ? 'bg-bone text-obsidian font-medium' : 'bg-white/5 text-silver hover:text-bone'} cursor-pointer shrink-0">${pad2(i + 1)} ${g.shortName}</button>`).join('');
'''
rep_between('    const GARMENTS = [', '    let selectedGarmentIdx = 0;', G + '\n')
rep('const cardSelectedSizes = [\'M\', \'M\', \'M\', \'M\', \'M\'];', "const cardSelectedSizes = GARMENTS.map(() => 'M');")

# play the active garment's 360° turn once when it arrives on the stage
rep_between("      for (let i = 0; i < 5; i++) {\n        const layer = document.getElementById(`stage-img-${i}`);", "      document.getElementById('frame-sku').textContent = g.sku;",
"""      for (let i = 0; i < NG; i++) {
        const layer = document.getElementById(`stage-img-${i}`);
        if (!layer) continue;
        if (i === idx) {
          layer.classList.remove('opacity-0', 'scale-105');
          layer.classList.add('opacity-100', 'scale-100');
          try { layer.currentTime = 0; const pr = layer.play(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) {}
        } else {
          layer.classList.remove('opacity-100', 'scale-100');
          layer.classList.add('opacity-0', 'scale-105');
          try { layer.pause(); } catch (e) {}
        }
      }

""")
rep("document.getElementById('frame-index').textContent = `0${idx + 1} / 05`;", "document.getElementById('frame-index').textContent = `${pad2(idx + 1)} / ${pad2(NG)}`;")
rep_between('    const STAGE_META = [', '    let activeStepIndex = -1;', "    const STAGE_META = GARMENTS.map((g, i) => `SEQ // ${String(i + 1).padStart(3, '0')} — ${g.name}`);\n\n")
rep_between("      let step = 0;\n      if (p >= 0.80) step = 4;", "      if (step !== activeStepIndex) {", "      const step = Math.min(NG - 1, Math.floor(p * NG));\n\n")
rep("        for (let i = 0; i < 5; i++) {\n          const panel = document.getElementById(`story-${i}`);", "        const cta = document.getElementById('drop-cta-panel');\n        cta.classList.toggle('story-active', step === NG - 1); cta.classList.toggle('story-hidden', step !== NG - 1);\n        for (let i = 0; i < NG; i++) {\n          const panel = document.getElementById(`story-${i}`);")
assert 'image_56' not in s, 'old image refs left'
for leftover in ('Crafted', 'neon rain', 'Forged once', 'Alabaster', 'ORBIT'):
    assert leftover not in s, 'leftover copy: ' + leftover
open(out_path, 'w').write(s)
print('written', len(s))
