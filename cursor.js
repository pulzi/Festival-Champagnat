// Cursor personalizado: ponto em brasa, anel que segue com atraso, rastro de faíscas
// e explosão no clique. Desligado no touch e para quem pede menos animação.
(() => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || calm) return;

  const root = document.documentElement;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  const label = document.createElement('span');
  const canvas = document.createElement('canvas');
  dot.className = 'cur-dot';
  ring.className = 'cur-ring';
  label.className = 'cur-label';
  canvas.className = 'cur-fx';
  ring.appendChild(label);
  document.body.append(canvas, ring, dot);
  root.classList.add('has-cursor');

  const ctx = canvas.getContext('2d');
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  const pos = { x: mouse.x, y: mouse.y };
  let last = { x: mouse.x, y: mouse.y };
  let visible = false;
  const sparks = [];
  const COLORS = ['#ffc61a', '#ff8a1f', '#ff4a1c', '#ffe7a3'];

  function spawn(x, y, n, speed, life) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.35 + Math.random() * 0.65);
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.15, life, max: life, r: 1 + Math.random() * 2, c: COLORS[(Math.random() * COLORS.length) | 0] });
    }
  }

  addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (!visible) { visible = true; pos.x = mouse.x; pos.y = mouse.y; root.classList.add('cur-on'); }
    const d = Math.hypot(mouse.x - last.x, mouse.y - last.y);
    if (d > 6) {
      const n = Math.min(3, Math.floor(d / 14));
      for (let i = 0; i < n; i++) {
        const t = Math.random();
        sparks.push({
          x: last.x + (mouse.x - last.x) * t, y: last.y + (mouse.y - last.y) * t,
          vx: (Math.random() - 0.5) * 0.6, vy: -0.3 - Math.random() * 0.8,
          life: 34, max: 34, r: 0.8 + Math.random() * 1.6, c: COLORS[(Math.random() * COLORS.length) | 0],
        });
      }
      last = { x: mouse.x, y: mouse.y };
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => { visible = false; root.classList.remove('cur-on'); });
  addEventListener('mousedown', () => { root.classList.add('cur-down'); spawn(mouse.x, mouse.y, 18, 4.2, 40); });
  addEventListener('mouseup', () => root.classList.remove('cur-down'));

  const HOVER = 'a, button, summary, label, .card, .shot, .kit > div';
  const TEXT = 'input, textarea, select, [contenteditable]';
  document.addEventListener('mouseover', (e) => {
    const t = e.target;
    const text = t.closest && t.closest(TEXT);
    const hit = !text && t.closest && t.closest(HOVER);
    root.classList.toggle('cur-text', !!text);
    root.classList.toggle('cur-hover', !!hit);
    const tip = hit && hit.dataset.cursor;
    label.textContent = tip || '';
    root.classList.toggle('cur-has-label', !!tip);
  });

  function frame() {
    pos.x += (mouse.x - pos.x) * 0.18;
    pos.y += (mouse.y - pos.y) * 0.18;
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    const dx = mouse.x - pos.x, dy = mouse.y - pos.y;
    const speed = Math.min(Math.hypot(dx, dy) / 60, 0.35);
    const ang = Math.atan2(dy, dx);
    ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${ang}rad) scale(${1 + speed}, ${1 - speed * 0.6})`;
    label.style.transform = `translate(-50%, -50%) rotate(${-ang}rad)`;

    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.vy += 0.06; s.vx *= 0.97;
      if (--s.life <= 0) { sparks.splice(i, 1); continue; }
      const k = s.life / s.max;
      ctx.globalAlpha = k;
      ctx.fillStyle = s.c; ctx.shadowColor = s.c; ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (0.5 + k * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
