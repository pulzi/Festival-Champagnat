// Cursor em forma de visor de câmera: quatro cantos que seguem o mouse e
// "travam o foco" (ficam verdes e abraçam o elemento) em tudo que é clicável.
// Desligado no touch e para quem pede menos animação.
(() => {
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!fine || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const vf = document.createElement('div');
  vf.className = 'vf';
  vf.innerHTML = '<i></i><i></i><i></i><i></i><b></b><em>AF ●</em>';
  document.body.appendChild(vf);
  document.documentElement.classList.add('has-vf');

  const m = { x: innerWidth / 2, y: innerHeight / 2 };
  const s = { x: m.x - 20, y: m.y - 20, w: 40, h: 40 };
  let target = null;
  const SNAP = 'a, button, summary, .tile, .roll, .frame, .pic, .flip, .chan, label';

  addEventListener('mousemove', (e) => { m.x = e.clientX; m.y = e.clientY; vf.classList.add('on'); }, { passive: true });
  document.addEventListener('mouseleave', () => vf.classList.remove('on'));
  document.addEventListener('mouseover', (e) => {
    target = e.target.closest && !e.target.closest('input, textarea') ? e.target.closest(SNAP) : null;
    vf.classList.toggle('lock', !!target);
  });
  addEventListener('mousedown', () => {
    vf.classList.remove('click'); void vf.offsetWidth; vf.classList.add('click');
  });

  (function frame() {
    let x, y, w, h;
    if (target && target.isConnected) {
      const r = target.getBoundingClientRect();
      const pad = 6;
      x = r.left - pad; y = r.top - pad; w = r.width + pad * 2; h = r.height + pad * 2;
      // elementos gigantes (cards grandes) não viram um quadro enorme: prende ao redor do mouse
      if (w > 520 || h > 420) { w = 64; h = 64; x = m.x - 32; y = m.y - 32; }
    } else { w = 40; h = 40; x = m.x - 20; y = m.y - 20; }
    const k = 0.22;
    s.x += (x - s.x) * k; s.y += (y - s.y) * k; s.w += (w - s.w) * k; s.h += (h - s.h) * k;
    vf.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
    vf.style.width = s.w + 'px'; vf.style.height = s.h + 'px';
    requestAnimationFrame(frame);
  })();
})();
