/* Light, cozy snowfall drawn on a see-through canvas over the scene. */
window.Snow = function (canvas, host) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, flakes = [], enabled = true, raf = null, last = 0, t = 0;

  function make(anywhere) {
    const z = Math.random(); // depth: 0 = far/small/slow, 1 = near/big/faster
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10,
      r: 0.6 + z * 2.4,
      vy: 0.25 + z * 0.8,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.006 + Math.random() * 0.01,
      swayAmp: 0.2 + z * 0.6,
      a: 0.35 + z * 0.5,
    };
  }

  function resize() {
    const r = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round((w * h) / 7000); // "light" density
    while (flakes.length < target) flakes.push(make(true));
    flakes.length = Math.min(flakes.length, target);
  }

  function frame(now) {
    const dt = last ? Math.min((now - last) / 16.67, 3) : 1;
    last = now; t += dt;
    const wind = Math.sin(t * 0.002) * 0.35;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    for (const f of flakes) {
      f.sway += f.swaySpeed * dt;
      f.y += f.vy * dt;
      f.x += (Math.sin(f.sway) * f.swayAmp * 0.5 + wind * (f.r / 2)) * dt;
      if (f.y > h + 5) Object.assign(f, make(false));
      if (f.x > w + 5) f.x = -5;
      if (f.x < -5) f.x = w + 5;
      if (f.r > 2) { // soft halo on the nearest flakes
        ctx.globalAlpha = f.a * 0.25;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = f.a;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  function setEnabled(v) {
    enabled = v;
    canvas.style.opacity = v ? 1 : 0;
    if (v && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    if (!v && raf) { cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, w, h); }
  }

  resize();
  setEnabled(true);
  return { resize, setEnabled, get enabled() { return enabled; } };
};

/* Paint a frozen snowfall onto an exported picture. */
window.Snow.paintStatic = function (ctx, w, h) {
  const n = Math.round((w * h) / 9000);
  const unit = Math.max(w, h) / 1400;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < n; i++) {
    const z = Math.random();
    const r = (0.6 + z * 2.4) * unit;
    const x = Math.random() * w, y = Math.random() * h;
    ctx.globalAlpha = (0.35 + z * 0.5) * 0.25;
    ctx.beginPath(); ctx.arc(x, y, r * 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.35 + z * 0.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
};
