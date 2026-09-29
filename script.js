const CFG = window.CONFIG || {};
const $ = (id) => document.getElementById(id);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Config → textos e links ----------
document.querySelectorAll('[data-cfg]').forEach((el) => {
  const v = CFG[el.dataset.cfg];
  if (v) el.textContent = v; else if (el.dataset.cfg === 'serie') el.remove();
});
$('lnkIg').href = 'https://instagram.com/' + encodeURIComponent(CFG.instagram || '');
$('lnkMail').href = 'mailto:' + (CFG.email || '');
if (CFG.albumUrl) {
  const a = document.createElement('a');
  a.className = 'chan'; a.href = CFG.albumUrl; a.target = '_blank'; a.rel = 'noopener'; a.dataset.cursor = 'abrir';
  a.innerHTML = '<span class="ci">🖼️</span><span><b>Álbum no Google Fotos</b><small>Todas as fotos do festival</small></span><i>→</i>';
  $('lnkIg').before(a);
}

// ---------- Brasas no hero ----------
const embers = document.querySelector('.embers');
if (embers && !calm) {
  for (let i = 0; i < 26; i++) {
    const e = document.createElement('i');
    e.style.left = Math.random() * 100 + '%';
    e.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    e.style.animationDuration = 6 + Math.random() * 8 + 's';
    e.style.animationDelay = -Math.random() * 14 + 's';
    const s = 2 + Math.random() * 3;
    e.style.width = e.style.height = s + 'px';
    embers.appendChild(e);
  }
}

// ---------- Visor: foco passeando, exposição e disparo ----------
const view = $('view'), focus = $('focus'), toast = $('toast');
const SPOTS = [[41, 44], [22, 50], [62, 48], [10, 40], [76, 46], [46, 30]];
const ISOS = [200, 400, 800, 1600], APS = ['1.4', '1.8', '2.8', '4'], SHS = ['1/125', '1/250', '1/500', '1/1000'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
setInterval(() => {
  const [x, y] = pick(SPOTS);
  focus.style.left = x + '%'; focus.style.top = y + '%';
  $('iso').textContent = pick(ISOS); $('ap').textContent = pick(APS); $('sh').textContent = pick(SHS);
}, 2200);

let toastTimer, shots = 128;
function shoot() {
  view.classList.remove('flash'); void view.offsetWidth; view.classList.add('flash');
  $('shots').textContent = ++shots;
  toast.textContent = '📸 Foto salva no cartão';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}
$('shutter').addEventListener('click', shoot);
addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.ctrlKey && !e.metaKey && !e.altKey &&
      !/input|textarea|button|summary|select/i.test(document.activeElement.tagName) && $('lb').hidden) {
    e.preventDefault(); shoot();
  }
});

// ---------- Galeria ----------
const fotos = (window.FOTOS || []).map((f) => typeof f === 'string' ? { src: f, categoria: 'Geral' } : f);
const gal = $('gallery'), filtros = $('filtros');
let atual = 'Todas', visiveis = [];

function renderGaleria() {
  gal.textContent = '';
  if (!fotos.length) {
    const alts = [190, 260, 220, 300, 200, 250];
    alts.forEach((h, i) => {
      const d = document.createElement('div');
      d.className = 'shot ph reveal';
      d.style.height = h + 'px';
      d.innerHTML = '<div><span>📷</span><br>Sua foto aparece aqui</div>';
      gal.appendChild(d);
    });
    $('galNote').innerHTML = 'Ainda sem fotos. Coloque as imagens na pasta <code>fotos</code> e rode o <code>atualizar-fotos.ps1</code>.';
    return;
  }
  $('galNote').textContent = 'Clique em uma foto para ampliar e baixar.';
  visiveis = fotos.filter((f) => atual === 'Todas' || f.categoria === atual);
  visiveis.forEach((f, i) => {
    const b = document.createElement('button');
    b.className = 'shot reveal';
    b.type = 'button';
    b.dataset.cursor = 'ver';
    const img = document.createElement('img');
    img.src = f.src; img.alt = f.legenda || `Foto do festival (${f.categoria})`; img.loading = 'lazy';
    b.appendChild(img);
    if (fotos.some((x) => x.categoria !== f.categoria)) {
      const c = document.createElement('span'); c.className = 'cat'; c.textContent = f.categoria; b.appendChild(c);
    }
    b.addEventListener('click', () => abrir(i));
    gal.appendChild(b);
  });
  observar(gal.querySelectorAll('.reveal'));
}

const cats = ['Todas', ...new Set(fotos.map((f) => f.categoria))];
if (cats.length > 2) {
  filtros.hidden = false;
  cats.forEach((c) => {
    const b = document.createElement('button');
    b.textContent = c; b.setAttribute('role', 'tab');
    b.className = c === atual ? 'on' : '';
    b.addEventListener('click', () => {
      atual = c;
      filtros.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      renderGaleria();
    });
    filtros.appendChild(b);
  });
}

// contador da faixa de números
(function () {
  const el = $('statFotos'), alvo = fotos.length;
  if (calm || !alvo) { el.textContent = alvo; return; }
  const t0 = performance.now();
  (function tick() {
    const k = Math.min(1, (performance.now() - t0) / 1200);
    el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(tick);
  })();
})();

// ---------- Lightbox ----------
const lb = $('lb');
let idx = 0;
function mostrar() {
  const f = visiveis[idx];
  $('lbImg').src = f.src;
  $('lbImg').alt = f.legenda || '';
  $('lbCap').textContent = `${idx + 1} / ${visiveis.length}${f.legenda ? ' · ' + f.legenda : ''}`;
  $('lbDl').href = f.src;
  $('lbDl').setAttribute('download', decodeURIComponent(f.src.split('/').pop()));
}
function abrir(i) { idx = i; mostrar(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('lbX').focus(); }
function fechar() { lb.hidden = true; document.body.style.overflow = ''; }
function ir(d) { idx = (idx + d + visiveis.length) % visiveis.length; mostrar(); }
$('lbX').addEventListener('click', fechar);
$('lbPrev').addEventListener('click', () => ir(-1));
$('lbNext').addEventListener('click', () => ir(1));
lb.addEventListener('click', (e) => { if (e.target === lb) fechar(); });
addEventListener('keydown', (e) => {
  if (lb.hidden) return;
  if (e.key === 'Escape') fechar();
  else if (e.key === 'ArrowLeft') ir(-1);
  else if (e.key === 'ArrowRight') ir(1);
});

// ---------- Formulário → e-mail pronto ----------
const form = $('form'), msg = $('formMsg');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const nome = (d.get('nome') || '').trim(), contato = (d.get('contato') || '').trim();
  form.nome.classList.toggle('bad', !nome);
  form.contato.classList.toggle('bad', !contato);
  if (!nome || !contato) { msg.textContent = 'Preencha seu nome e um contato para eu te responder.'; return; }
  const corpo = `Oi! Sou ${nome} (${contato}).\n\nOnde e quando: ${d.get('onde') || '-'}\nComo eu estava: ${d.get('msg') || '-'}\n`;
  location.href = `mailto:${CFG.email || ''}?subject=${encodeURIComponent('Pedido de foto: ' + (CFG.evento || 'Festival'))}&body=${encodeURIComponent(corpo)}`;
  msg.textContent = 'Abrindo seu app de e-mail. Se nada abrir, me chame pelo Instagram.';
});

// ---------- Progresso, topo e aparecer ao rolar ----------
const root = document.documentElement;
const bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
const top = document.createElement('button');
top.className = 'to-top'; top.setAttribute('aria-label', 'Voltar ao topo'); top.dataset.cursor = '↑ topo'; top.textContent = '↑';
top.addEventListener('click', () => scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }));
document.body.appendChild(top);
let ticking = false;
function onScroll() {
  const max = root.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  top.classList.toggle('show', scrollY > innerHeight * 0.9);
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

const io = (!calm && 'IntersectionObserver' in window) ? new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { rootMargin: '0px 0px -8% 0px' }) : null;
function observar(list) {
  list.forEach((el) => {
    if (!io) { el.classList.add('in'); return; }
    const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.setProperty('--d', Math.min(sib, 6) * 60 + 'ms');
    el.classList.add('reveal');
    io.observe(el);
  });
}

renderGaleria();
observar(document.querySelectorAll('.card, .steps > li, .stats > div, .faq details, .title, .form, .chan, .portrait, .about-text'));
