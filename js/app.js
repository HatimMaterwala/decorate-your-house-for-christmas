(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const wrap = $('#stageWrap');

  /* ---------------- Scene setup ----------------
   * Everything lives in "world" coordinates = the photo's pixel size (capped at 2000px).
   * The stage is scaled to fit the screen, so decorations stay glued to the house on resize.
   */
  const WORLD = { w: 1600, h: 1000 };
  let U = 1;      // size unit: 1 at a 1600px-wide scene
  let scale = 1;  // world -> screen

  const ITEMS = {};
  [...DECORATIONS.hanging, ...DECORATIONS.figures].forEach(it => (ITEMS[it.id] = it));
  const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);

  const stage = new Konva.Stage({ container: 'stage', width: 10, height: 10 });
  const bgLayer = new Konva.Layer();
  const decoLayer = new Konva.Layer();
  const previewLayer = new Konva.Layer({ listening: false });
  stage.add(bgLayer, decoLayer, previewLayer);

  const houseImg = new Konva.Image({ name: 'bg' });
  const nightRect = new Konva.Rect({ fill: '#081330', opacity: 0, listening: false });
  bgLayer.add(houseImg, nightRect);

  const tr = new Konva.Transformer({
    keepRatio: true,
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    anchorSize: 11, anchorCornerRadius: 6, padding: 6,
    borderStroke: '#f3c35b', borderDash: [5, 4],
    anchorStroke: '#f3c35b', anchorFill: '#19243f',
    rotateAnchorOffset: 30,
  });
  decoLayer.add(tr);

  const snow = Snow($('#snow'), wrap);

  function fit() {
    const r = wrap.getBoundingClientRect();
    const pad = window.innerWidth < 860 ? 12 : 18;
    scale = Math.min((r.width - pad * 2) / WORLD.w, (r.height - pad * 2) / WORLD.h);
    stage.size({ width: Math.round(WORLD.w * scale), height: Math.round(WORLD.h * scale) });
    stage.scale({ x: scale, y: scale });
    snow.resize();
  }
  window.addEventListener('resize', fit);

  function setHouse(img) {
    const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const s = Math.min(1, 2000 / Math.max(w, h));
    WORLD.w = Math.round(w * s);
    WORLD.h = Math.round(h * s);
    U = Math.max(WORLD.w, WORLD.h) / 1600;
    houseImg.setAttrs({ image: img, width: WORLD.w, height: WORLD.h });
    nightRect.size({ width: WORLD.w, height: WORLD.h });
    fit();
    bgLayer.batchDraw();
  }

  function setNight(v) {
    $('#nightRange').value = v;
    nightRect.opacity(v);
    bgLayer.batchDraw();
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(msg, ms = 2600) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), ms);
  }
  Music.onNotice(msg => toast(msg, 9000));

  /* ---------------- Photo upload ---------------- */
  function loadPhoto(file) {
    if (!file || !file.type.startsWith('image/')) {
      toast('Please choose an image file (JPG or PNG)');
      return;
    }
    const img = new Image();
    img.onload = () => {
      clearAll();
      setHouse(img);
      setNight(0.3);
      toast('Looking good! Now add some lights ✨');
    };
    img.onerror = () => toast("Couldn't read that image. Try a JPG or PNG.");
    img.src = URL.createObjectURL(file);
  }
  $('#photoInput').addEventListener('change', e => { loadPhoto(e.target.files[0]); e.target.value = ''; });

  /* ---------------- Selection ---------------- */
  let selected = null;
  const selTools = $('#selTools');

  function select(node) {
    selected = node;
    tr.nodes(node ? [node] : []);
    tr.moveToTop();
    if (!node) hideMenu();
    decoLayer.batchDraw();
  }

  const decoOf = t => (t.hasName('deco') ? t : t.findAncestor('.deco'));

  /* ---- Right-click menu, shown beside the decoration ---- */
  function hideMenu() { selTools.classList.add('hidden'); }

  function showMenu(node) {
    selTools.classList.remove('hidden');
    placeMenu(node);
  }

  // Put the menu just to the right of the item (or to its left if there's no room), vertically centred.
  function placeMenu(node) {
    if (selTools.classList.contains('hidden')) return;
    const gap = 14;
    const r = node.getClientRect();                       // item box in stage pixels
    const s = stage.container().getBoundingClientRect();  // stage position on screen
    const w = wrap.getBoundingClientRect();
    const mw = selTools.offsetWidth, mh = selTools.offsetHeight;
    const ox = s.left - w.left, oy = s.top - w.top;
    let left = ox + r.x + r.width + gap;
    if (left + mw > w.width - 8) left = ox + r.x - mw - gap;  // flip to the left side
    left = Math.max(8, Math.min(left, w.width - mw - 8));
    let top = oy + r.y + r.height / 2 - mh / 2;
    top = Math.max(8, Math.min(top, w.height - mh - 8));
    selTools.style.left = left + 'px';
    selTools.style.top = top + 'px';
  }

  stage.on('mousedown touchstart', e => {
    if (mode === 'draw') return;
    if (e.evt.button === 2) return; // right button is handled by contextmenu
    hideMenu();
    const t = e.target;
    if (t === stage || t.hasName('bg')) return select(null);
    if (t.findAncestor('Transformer')) return;
    const deco = decoOf(t);
    if (deco) select(deco);
  });

  stage.on('contextmenu', e => {
    e.evt.preventDefault();
    if (mode === 'draw') return;
    const deco = decoOf(e.target) || (e.target.findAncestor('Transformer') ? selected : null);
    if (!deco) { select(null); return; }
    select(deco);
    showMenu(deco);
  });
  wrap.addEventListener('contextmenu', e => e.preventDefault());

  // Phones have no right-click: long-press an item to open the same menu.
  let pressTimer = null;
  stage.on('touchstart', e => {
    clearTimeout(pressTimer);
    const deco = mode === 'select' && decoOf(e.target);
    if (deco) pressTimer = setTimeout(() => { select(deco); showMenu(deco); }, 550);
  });
  stage.on('touchmove touchend dragstart', () => clearTimeout(pressTimer));

  // Moving or resizing the item closes the menu.
  decoLayer.on('dragstart transformstart', hideMenu);
  document.addEventListener('pointerdown', e => {
    if (!selTools.contains(e.target) && !e.target.closest('#stage')) hideMenu();
  });
  window.addEventListener('resize', hideMenu);

  // After an action, keep the menu next to the item (it may have moved or changed size).
  const keepMenu = () => { if (selected) placeMenu(selected); };

  $('#dupBtn').onclick = () => {
    if (!selected) return;
    const c = selected.clone({ x: selected.x() + 30 * U, y: selected.y() + 30 * U });
    decoLayer.add(c);
    select(c);
    keepMenu();
  };
  $('#flipBtn').onclick = () => { if (selected) { selected.scaleX(-selected.scaleX()); decoLayer.batchDraw(); keepMenu(); } };
  $('#fwdBtn').onclick = () => { if (selected) { selected.moveToTop(); tr.moveToTop(); decoLayer.batchDraw(); } };
  $('#backBtn').onclick = () => { if (selected) { selected.moveToBottom(); decoLayer.batchDraw(); } };
  $('#delBtn').onclick = () => { if (selected) { selected.destroy(); select(null); } };

  function clearAll() {
    decoLayer.getChildren(n => n !== tr).forEach(n => n.destroy());
    select(null);
  }
  $('#clearBtn').onclick = () => { clearAll(); toast('Cleared'); };

  /* ---------------- Decorations (images) ---------------- */
  const imgCache = {};
  function getImg(item) {
    if (!imgCache[item.id]) {
      const im = new Image();
      im.src = svgUrl(item.svg);
      imgCache[item.id] = im;
    }
    return imgCache[item.id];
  }

  function addDecoration(id, pos) {
    const item = ITEMS[id];
    const img = getImg(item);
    const place = () => {
      const w = item.size * U;
      const h = (w * item.h) / item.w;
      const node = new Konva.Image({
        image: img, x: pos.x, y: pos.y, width: w, height: h,
        offsetX: w / 2, offsetY: h / 2, draggable: true, name: 'deco',
      });
      if (item.glow) node.setAttrs({ shadowColor: item.glow, shadowBlur: 28 * U, shadowOpacity: 0.9 });
      decoLayer.add(node);
      select(node);
      node.scale({ x: 0.6, y: 0.6 });
      node.to({ scaleX: 1, scaleY: 1, duration: 0.25, easing: Konva.Easings.BackEaseOut });
    };
    if (img.complete && img.naturalWidth) place();
    else img.addEventListener('load', place, { once: true });
  }

  function buildGrid(list, el) {
    list.forEach(it => {
      const b = document.createElement('button');
      b.className = 'tile';
      b.draggable = true;
      b.innerHTML = `<img alt="" src="${svgUrl(it.svg)}"><span>${it.name}</span>`;
      b.addEventListener('click', () => {
        const jitter = () => (Math.random() - 0.5) * 120 * U;
        addDecoration(it.id, { x: WORLD.w / 2 + jitter(), y: WORLD.h / 2 + jitter() });
      });
      b.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', it.id);
        e.dataTransfer.effectAllowed = 'copy';
      });
      el.appendChild(b);
    });
  }
  buildGrid(DECORATIONS.hanging, $('#grid-hanging'));
  buildGrid(DECORATIONS.figures, $('#grid-figures'));

  // Drag & drop: decorations from the sidebar, or a photo file from the desktop.
  wrap.addEventListener('dragover', e => {
    e.preventDefault();
    if ([...e.dataTransfer.types].includes('Files')) wrap.classList.add('dragging-file');
  });
  wrap.addEventListener('dragleave', e => { if (e.target === wrap || !wrap.contains(e.relatedTarget)) wrap.classList.remove('dragging-file'); });
  wrap.addEventListener('drop', e => {
    e.preventDefault();
    wrap.classList.remove('dragging-file');
    if (e.dataTransfer.files.length) return loadPhoto(e.dataTransfer.files[0]);
    const id = e.dataTransfer.getData('text/plain');
    if (!ITEMS[id]) return;
    stage.setPointersPositions(e);
    const p = stage.getRelativePointerPosition();
    addDecoration(id, {
      x: Math.max(0, Math.min(WORLD.w, p.x)),
      y: Math.max(0, Math.min(WORLD.h, p.y)),
    });
  });

  /* ---------------- Light strings ---------------- */
  const LIGHT_STYLES = {
    mini: { name: 'Fairy lights', r: 3.2, spacing: 16 },
    c9: { name: 'Big bulbs', r: 6.5, spacing: 34 },
    icicle: { name: 'Icicles', r: 2.6, spacing: 14 },
  };
  const PALETTES = {
    multi: { name: 'Multicolour', colors: ['#ff3b3b', '#ffd23f', '#3bd16f', '#3b8bff', '#ff7ad9', '#ff9b2f'] },
    warm: { name: 'Warm white', colors: ['#ffd98a', '#ffe7b0'] },
    cool: { name: 'Cool white', colors: ['#e6f3ff', '#c4e4ff'] },
    redgreen: { name: 'Red & green', colors: ['#ff3344', '#2fd36a'] },
    blue: { name: 'Icy blue', colors: ['#4aa3ff', '#8fd0ff', '#2f6bff'] },
    candy: { name: 'Candy cane', colors: ['#ff3344', '#ffffff'] },
    gold: { name: 'Gold', colors: ['#ffb627', '#ffd77a'] },
  };
  const EFFECTS = { twinkle: 'Twinkle', steady: 'Steady', chase: 'Chase', fade: 'Breathe' };

  let lightStyle = 'mini', lightPalette = 'multi', effect = 'twinkle';

  const rand = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const rgba = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  // Turn the clicked points into a gently sagging wire, like real lights hung between hooks.
  function sagPath(flat) {
    const out = [];
    for (let i = 0; i + 3 < flat.length; i += 2) {
      const ax = flat[i], ay = flat[i + 1], bx = flat[i + 2], by = flat[i + 3];
      const len = Math.hypot(bx - ax, by - ay);
      if (len < 0.5) continue;
      const flatness = 1 - Math.abs(by - ay) / len; // horizontal runs sag, vertical runs don't
      const sag = Math.min(len * 0.06, 40 * U) * flatness;
      const steps = Math.max(4, Math.ceil(len / (8 * U)));
      for (let s = out.length ? 1 : 0; s <= steps; s++) {
        const t = s / steps;
        out.push(ax + (bx - ax) * t, ay + (by - ay) * t + sag * 4 * t * (1 - t));
      }
    }
    return out;
  }

  // Evenly spaced points along a polyline.
  function samplePath(pts, spacing) {
    if (pts.length < 2) return [];
    const res = [{ x: pts[0], y: pts[1] }];
    let acc = 0;
    for (let i = 0; i + 3 < pts.length; i += 2) {
      const ax = pts[i], ay = pts[i + 1], bx = pts[i + 2], by = pts[i + 3];
      const L = Math.hypot(bx - ax, by - ay);
      if (!L) continue;
      let pos = spacing - acc;
      while (pos <= L) {
        res.push({ x: ax + ((bx - ax) * pos) / L, y: ay + ((by - ay) * pos) / L });
        pos += spacing;
      }
      acc = L - (pos - spacing);
    }
    return res;
  }

  function bulb(x, y, r, color, idx) {
    const R = r * 3.4;
    const c = new Konva.Circle({
      x, y, radius: R, name: 'bulb', listening: false, perfectDrawEnabled: false,
      fillRadialGradientStartPoint: { x: 0, y: 0 }, fillRadialGradientEndPoint: { x: 0, y: 0 },
      fillRadialGradientStartRadius: 0, fillRadialGradientEndRadius: R,
      fillRadialGradientColorStops: [0, '#ffffff', 0.12, '#ffffff', 0.27, color, 0.45, rgba(color, 0.45), 1, rgba(color, 0)],
    });
    c.setAttr('phase', rand(idx + 1) * Math.PI * 2);
    c.setAttr('idx', idx);
    return c;
  }

  function buildLights(flat, styleKey, palKey, preview) {
    const st = LIGHT_STYLES[styleKey];
    const colors = PALETTES[palKey].colors;
    const r = st.r * U;
    const path = sagPath(flat);

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < flat.length; i += 2) {
      minX = Math.min(minX, flat[i]); maxX = Math.max(maxX, flat[i]);
      minY = Math.min(minY, flat[i + 1]); maxY = Math.max(maxY, flat[i + 1]);
    }
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;

    // Group is centred on the string so flip / rotate happen around its middle.
    const g = new Konva.Group({
      x: cx, y: cy, offsetX: cx, offsetY: cy,
      draggable: !preview, listening: !preview, name: preview ? '' : 'deco lights',
    });
    g.setAttrs({ pts: flat.slice(), lightStyle: styleKey, lightPalette: palKey });

    g.add(new Konva.Line({
      points: path, stroke: '#16261b', opacity: 0.9,
      strokeWidth: Math.max(1, (styleKey === 'c9' ? 2.4 : 1.4) * U),
      lineJoin: 'round', lineCap: 'round', hitStrokeWidth: 26 * U,
    }));

    const pts = samplePath(path, st.spacing * U);
    let idx = 0;
    if (styleKey === 'icicle') {
      pts.forEach((p, i) => {
        const len = (14 + rand(i) * 46) * U;
        g.add(new Konva.Line({ points: [p.x, p.y, p.x, p.y + len], stroke: '#16261b', strokeWidth: U, opacity: 0.8 }));
        for (let y = 6 * U; y <= len; y += 11 * U) g.add(bulb(p.x, p.y + y, r, colors[idx % colors.length], idx++));
      });
    } else {
      pts.forEach(p => {
        if (styleKey === 'c9') {
          g.add(new Konva.Rect({ x: p.x - r * 0.4, y: p.y - r * 0.2, width: r * 0.8, height: r * 0.9, fill: '#1d3a24', cornerRadius: U }));
          g.add(bulb(p.x, p.y + r * 1.1, r, colors[idx % colors.length], idx++));
        } else {
          g.add(bulb(p.x, p.y, r, colors[idx % colors.length], idx++));
        }
      });
    }
    return g;
  }

  // Twinkle / chase / breathe animation.
  let step = 0;
  setInterval(() => {
    const bulbs = decoLayer.find('.bulb');
    if (!bulbs.length) return;
    const t = performance.now() / 1000;
    step++;
    bulbs.forEach(b => {
      const ph = b.getAttr('phase'), i = b.getAttr('idx');
      let o = 1;
      if (effect === 'twinkle') o = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1.2 + (ph % 1) * 2.5) + ph));
      else if (effect === 'chase') o = (i + Math.floor(step / 2)) % 3 === 0 ? 1 : 0.25;
      else if (effect === 'fade') o = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 1.6));
      b.opacity(o);
    });
    decoLayer.batchDraw();
  }, 110);

  /* ---------------- Drawing mode ---------------- */
  let mode = 'select';
  let drawPts = [];
  let cursor = null;
  let previewQueued = false;

  function startDraw() {
    select(null);
    mode = 'draw';
    drawPts = [];
    cursor = null;
    bgLayer.listening(false);
    decoLayer.listening(false);
    wrap.classList.add('drawing');
    $('#drawBar').classList.remove('hidden');
  }

  function dedupe(flat) {
    const out = [];
    const minD = 6 / scale;
    for (let i = 0; i < flat.length; i += 2) {
      const n = out.length;
      if (n && Math.hypot(flat[i] - out[n - 2], flat[i + 1] - out[n - 1]) < minD) continue;
      out.push(flat[i], flat[i + 1]);
    }
    return out;
  }

  function endDraw(commit) {
    if (mode !== 'draw') return;
    const pts = dedupe(drawPts);
    if (commit && pts.length >= 4) {
      const g = buildLights(pts, lightStyle, lightPalette, false);
      decoLayer.add(g);
      tr.moveToTop();
      toast('Lights up! Draw another string or move this one.');
    } else if (commit) {
      toast('Click at least two points to hang a string');
    }
    previewLayer.destroyChildren();
    previewLayer.batchDraw();
    mode = 'select';
    bgLayer.listening(true);
    decoLayer.listening(true);
    wrap.classList.remove('drawing');
    $('#drawBar').classList.add('hidden');
  }

  function renderPreview() {
    previewQueued = false;
    previewLayer.destroyChildren();
    const pts = cursor ? drawPts.concat(cursor.x, cursor.y) : drawPts;
    if (pts.length >= 4) previewLayer.add(buildLights(dedupe(pts), lightStyle, lightPalette, true));
    for (let i = 0; i < drawPts.length; i += 2) {
      previewLayer.add(new Konva.Circle({ x: drawPts[i], y: drawPts[i + 1], radius: 5 / scale, stroke: '#f3c35b', strokeWidth: 2 / scale }));
    }
    previewLayer.batchDraw();
  }
  const queuePreview = () => { if (!previewQueued) { previewQueued = true; requestAnimationFrame(renderPreview); } };

  // Our own double-click detection: Konva's dblclick fires for any two quick clicks, even far
  // apart, which would end the string early when people click quickly along a roof.
  let lastClickAt = 0;
  stage.on('click tap', () => {
    if (mode !== 'draw') return;
    const p = stage.getRelativePointerPosition();
    const now = performance.now();
    const n = drawPts.length;
    const nearLast = n && Math.hypot(p.x - drawPts[n - 2], p.y - drawPts[n - 1]) < 12 / scale;
    if (nearLast && now - lastClickAt < 500) return endDraw(true);
    lastClickAt = now;
    drawPts.push(p.x, p.y);
    queuePreview();
  });
  stage.on('mousemove touchmove', () => {
    if (mode !== 'draw' || !drawPts.length) return;
    cursor = stage.getRelativePointerPosition();
    queuePreview();
  });
  stage.on('mouseleave', () => { if (mode === 'draw') { cursor = null; queuePreview(); } });

  $('#drawLightsBtn').onclick = startDraw;
  $('#finishDraw').onclick = () => endDraw(true);
  $('#cancelDraw').onclick = () => endDraw(false);

  // Restyle a selected string when a new style / colour is picked.
  function restyleSelected() {
    if (!selected || !selected.hasName('lights')) return false;
    const old = selected;
    const g = buildLights(old.getAttr('pts'), lightStyle, lightPalette, false);
    g.setAttrs({ x: old.x(), y: old.y(), rotation: old.rotation(), scaleX: old.scaleX(), scaleY: old.scaleY() });
    const z = old.zIndex();
    old.destroy();
    decoLayer.add(g);
    g.zIndex(z);
    select(g);
    return true;
  }

  function chipGroup(el, entries, getActive, onPick) {
    entries.forEach(([key, label, html]) => {
      const b = document.createElement('button');
      b.className = 'chip';
      b.dataset.key = key;
      b.innerHTML = (html || '') + label;
      b.onclick = () => {
        onPick(key);
        el.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.key === getActive()));
      };
      if (key === getActive()) b.classList.add('active');
      el.appendChild(b);
    });
  }

  chipGroup($('#lightStyles'), Object.entries(LIGHT_STYLES).map(([k, v]) => [k, v.name]),
    () => lightStyle, k => { lightStyle = k; if (mode === 'draw') queuePreview(); else restyleSelected(); });

  chipGroup($('#lightPalettes'),
    Object.entries(PALETTES).map(([k, v]) => [k, v.name,
      `<span class="dots">${v.colors.slice(0, 4).map(c => `<i style="background:${c};color:${c}"></i>`).join('')}</span>`]),
    () => lightPalette, k => { lightPalette = k; if (mode === 'draw') queuePreview(); else restyleSelected(); });

  chipGroup($('#lightEffects'), Object.entries(EFFECTS), () => effect, k => {
    effect = k;
    if (k === 'steady') { decoLayer.find('.bulb').forEach(b => b.opacity(1)); decoLayer.batchDraw(); }
  });

  /* ---------------- Tabs ---------------- */
  document.querySelectorAll('.tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + tab.dataset.tab));
    };
  });

  /* ---------------- Top bar ---------------- */
  $('#nightRange').addEventListener('input', e => setNight(+e.target.value));
  $('#snowToggle').onclick = e => {
    snow.setEnabled(!snow.enabled);
    e.currentTarget.classList.toggle('on', snow.enabled);
  };

  $('#downloadBtn').onclick = () => {
    select(null);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      if (snow.enabled) Snow.paintStatic(ctx, c.width, c.height);
      c.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'my-christmas-house.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        toast('Saved! Share your festive house 🎄');
      });
    };
    img.src = stage.toDataURL({ pixelRatio: 1 / scale });
  };

  /* ---------------- Keyboard ---------------- */
  window.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (mode === 'draw') {
      if (e.key === 'Enter') endDraw(true);
      if (e.key === 'Escape') endDraw(false);
      if ((e.key === 'Backspace' || e.key === 'z') && drawPts.length) { drawPts.splice(-2); queuePreview(); }
      return;
    }
    if (!selected) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); $('#delBtn').click(); }
    if (e.key === 'Escape') select(null);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); $('#dupBtn').click(); }
  });

  /* ---------------- Music panel (right column) ---------------- */
  const panel = $('#musicPanel');
  const playBtn = $('#playBtn');
  const nudge = $('#musicNudge');
  const list = $('#trackList');
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const groups = { youtube: 'Christmas hits', synth: 'Music-box carols', file: 'Your songs' };

  Music.onChange(s => {
    $('#trackTitle').textContent = s.title;
    $('#trackTitle').title = s.title;
    $('#trackArtist').textContent = s.artist || '';
    playBtn.textContent = s.playing ? '❚❚' : '▶';
    playBtn.title = playBtn.ariaLabel = s.playing ? 'Stop music' : 'Play music';
    panel.classList.toggle('is-playing', s.playing);
    panel.classList.toggle('has-video', s.started && s.type === 'youtube');
    if (s.started) nudge.classList.add('hidden');

    list.innerHTML = '';
    let lastType = null;
    s.tracks.forEach((t, i) => {
      if (t.type !== lastType) {
        lastType = t.type;
        const h = document.createElement('li');
        h.className = 'group';
        h.textContent = groups[t.type];
        list.appendChild(h);
      }
      const li = document.createElement('li');
      li.className = i === s.index ? 'current' : '';
      li.title = `${t.title} — ${t.artist}`;
      li.innerHTML = `<span>${i === s.index && s.playing ? '♪ ' : ''}${esc(t.title)}</span><small>${t.type === 'synth' ? '' : esc(t.artist)}</small>`;
      li.onclick = () => Music.playIndex(i);
      list.appendChild(li);
    });
    const cur = list.querySelector('li.current');
    if (cur) {
      const top = cur.offsetTop - list.offsetTop, bottom = top + cur.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top - 30;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight + 8;
    }
  });

  playBtn.onclick = () => Music.toggle();
  $('#nextBtn').onclick = () => Music.next();
  $('#prevBtn').onclick = () => Music.prev();
  $('#volume').addEventListener('input', e => Music.setVolume(+e.target.value));
  $('#songInput').addEventListener('change', e => { Music.addFiles(e.target.files); e.target.value = ''; });

  // Browsers block audio until the user interacts, so music starts on the first click anywhere
  // (clicks inside the music panel are left to its own buttons).
  const kick = e => {
    document.removeEventListener('pointerdown', kick, true);
    if (!Music.state().started && !e.target.closest('#musicPanel')) Music.play();
  };
  document.addEventListener('pointerdown', kick, true);

  /* ---------------- Start with a sample house ---------------- */
  const sample = new Image();
  sample.onload = () => setHouse(sample);
  sample.src = svgUrl(DEFAULT_HOUSE);
  fit();
})();
