// Parte comum a todas as páginas: cabeçalho, rodapé, dados dos álbuns,
// favoritas (salvas no navegador de quem visita) e o visualizador de fotos.
(() => {
  const CFG = window.CONFIG || {};
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src);

  // ---------- Fotos de exemplo (aparecem só enquanto a pasta "fotos" está vazia) ----------
  const PAL = {
    palco: ['#1a0f45', '#8a2a9f', '#ff6a3d'], barracas: ['#3a1408', '#d4530c', '#ffc61a'],
    turma: ['#062a5c', '#1d6fd6', '#9bd3ff'], momentos: ['#0a2a3a', '#0f7c8a', '#f5d08a'],
    videos: ['#101a3a', '#2a4bd6', '#8fb0ff'],
  };
  function sample(key, i) {
    const [a, b, c] = PAL[key] || PAL.momentos;
    let s = (key.length * 97 + i * 131) % 233 + 7;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const tall = i % 3 === 1, W = tall ? 800 : 1000, H = tall ? 1000 : 700;
    let g = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>`;
    for (let n = 0; n < 14; n++) g += `<circle cx="${r() * W | 0}" cy="${r() * H * .55 | 0}" r="${18 + r() * 42 | 0}" fill="${c}" opacity="${.14 + r() * .3}"/>`;
    for (let n = 0; n < 14; n++) g += `<path d="M${n * W / 13 - 20} 0 l40 0 l-20 46z" fill="${n % 2 ? '#fff' : c}" opacity=".7"/>`;
    const people = 3 + (i % 3);
    for (let n = 0; n < people; n++) {
      const x = (n + .5) * W / people + (r() - .5) * 60, hh = H * (.34 + r() * .18), w = hh * .55;
      g += `<ellipse cx="${x}" cy="${H - hh * .62}" rx="${w / 2}" ry="${hh * .62}" fill="#050b1a" opacity=".92"/><circle cx="${x}" cy="${H - hh * 1.32}" r="${w * .3}" fill="#050b1a" opacity=".92"/>`;
    }
    return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`)}`;
  }

  // ---------- Álbuns ----------
  function buildAlbums() {
    const reais = (window.FOTOS || []).map((f) => typeof f === 'string' ? { src: f, categoria: 'Geral' } : f);
    const map = new Map();
    const meta = (key, nome) => Object.assign({ titulo: nome, emoji: '📷', desc: '' }, (CFG.albuns || {})[key]);
    if (reais.length) {
      reais.forEach((f) => {
        const key = slug(f.categoria || 'Geral') || 'geral';
        if (!map.has(key)) map.set(key, { key, ...meta(key, f.categoria || 'Geral'), fotos: [] });
        const n = map.get(key).fotos.length + 1;
        map.get(key).fotos.push({ id: f.src, src: f.src, video: isVideo(f.src), album: key, n });
      });
      return { albuns: [...map.values()], exemplo: false };
    }
    const albuns = ['palco', 'barracas', 'turma', 'momentos'].map((key) => ({
      key, ...meta(key, key), fotos: Array.from({ length: 6 }, (_, i) => ({ id: `ex:${key}:${i + 1}`, src: sample(key, i), video: false, album: key, n: i + 1, exemplo: true })),
    }));
    return { albuns, exemplo: true };
  }
  const data = buildAlbums();
  const todas = data.albuns.flatMap((a) => a.fotos);

  // ---------- Favoritas ----------
  const KEY = 'fc-favs';
  let favs = new Set();
  try { favs = new Set(JSON.parse(localStorage.getItem(KEY)) || []); } catch {}
  const isFav = (id) => favs.has(id);
  function toggleFav(id) {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    try { localStorage.setItem(KEY, JSON.stringify([...favs])); } catch {}
    document.dispatchEvent(new Event('favs'));
    toast(favs.has(id) ? '♥ Adicionada às favoritas' : 'Removida das favoritas');
  }

  // ---------- Toast ----------
  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // ---------- Cabeçalho e rodapé ----------
  const page = document.body.dataset.page;
  const NAV = [['index.html', 'Início', 'home'], ['registros.html', 'Registros', 'registros'], ['sobre.html', 'Sobre e equipamentos', 'sobre'], ['pedir.html', 'Pedir fotos', 'pedir']];
  const APERTURE = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor">' + [0, 60, 120, 180, 240, 300].map((r) => `<path transform="rotate(${r} 50 50)" d="M50 50 L50 6 A44 44 0 0 1 88 28 Z" opacity=".${r % 120 ? 55 : 85}"/>`).join('') + '</g><circle cx="50" cy="50" r="9" fill="#071a3a"/></svg>';
  document.body.insertAdjacentHTML('afterbegin', `
    <header class="nav">
      <a class="brand" href="index.html"><span class="ap">${APERTURE}</span><span>Fotos do <b>${CFG.evento || 'Festival'}</b></span></a>
      <button class="burger" id="burger" aria-label="Abrir menu" aria-expanded="false">☰</button>
      <nav id="menu">
        ${NAV.map(([h, t, p]) => `<a href="${h}"${p === page ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('')}
        <a class="fav-pill" href="pedir.html" title="Minhas favoritas">♥ <b id="favCount">0</b></a>
      </nav>
    </header>`);
  document.body.insertAdjacentHTML('beforeend', `
    <footer class="foot">
      <div class="foot-in">
        <div><span class="ap big">${APERTURE}</span><p><b>Fotos do ${CFG.evento || 'Festival'}</b><br>por ${CFG.nome || ''}</p></div>
        <div><h4>Navegar</h4>${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join('')}</div>
        <div><h4>Contato</h4><a href="https://instagram.com/${CFG.instagram || ''}" target="_blank" rel="noopener">@${CFG.instagram || ''}</a><a href="mailto:${CFG.email || ''}">${CFG.email || ''}</a></div>
      </div>
      <p class="quote">“Formar bons cristãos e virtuosos cidadãos.” <span>Marcelino Champagnat</span></p>
      <p class="small">Projeto de aluno, sem vínculo oficial com o colégio. Site feito com o Claude Code.</p>
    </footer>`);
  $('#burger').addEventListener('click', (e) => {
    const on = $('#menu').classList.toggle('open');
    e.currentTarget.setAttribute('aria-expanded', on);
  });
  const updCount = () => { $('#favCount').textContent = favs.size; };
  document.addEventListener('favs', updCount); updCount();

  // textos vindos do config
  document.querySelectorAll('[data-cfg]').forEach((el) => {
    const v = CFG[el.dataset.cfg];
    if (v) el.textContent = v; else if (el.dataset.cfg === 'serie') el.remove();
  });

  // barra de progresso
  const bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
  addEventListener('scroll', () => {
    const m = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${m > 0 ? scrollY / m : 0})`;
  }, { passive: true });

  // ---------- Aparecer ao rolar ----------
  const io = (!calm && 'IntersectionObserver' in window) ? new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function reveal(list) {
    list.forEach((el, i) => {
      el.classList.add('rv');
      if (!io) { el.classList.add('in'); return; }
      el.style.setProperty('--d', Math.min(i, 8) * 55 + 'ms');
      io.observe(el);
    });
  }

  // ---------- Grade de fotos ----------
  function tile(f, list, i) {
    const d = document.createElement('div');
    d.className = 'tile';
    const open = document.createElement('button');
    open.type = 'button'; open.className = 'tile-open'; open.setAttribute('aria-label', `Abrir ${f.video ? 'vídeo' : 'foto'} ${f.n}`);
    open.innerHTML = f.video ? `<video src="${f.src}#t=0.1" preload="metadata" muted playsinline></video><span class="play">▶</span>` : `<img src="${f.src}" alt="Foto ${f.n} do festival" loading="lazy">`;
    open.addEventListener('click', () => openLightbox(list, i));
    const h = document.createElement('button');
    h.type = 'button'; h.className = 'heart'; h.setAttribute('aria-label', 'Favoritar');
    const sync = () => { const on = isFav(f.id); h.classList.toggle('on', on); h.setAttribute('aria-pressed', on); h.textContent = on ? '♥' : '♡'; };
    h.addEventListener('click', (e) => { e.stopPropagation(); toggleFav(f.id); if (isFav(f.id)) window.FC.burst(h); });
    document.addEventListener('favs', sync); sync();
    const fn = document.createElement('span'); fn.className = 'fn'; fn.textContent = `▸ ${String(f.n).padStart(2, '0')}A`;
    d.append(open, h, fn);
    if (f.exemplo) { const t = document.createElement('span'); t.className = 'ex'; t.textContent = 'exemplo'; d.appendChild(t); }
    return d;
  }
  function renderGrid(container, list) {
    container.textContent = '';
    list.forEach((f, i) => container.appendChild(tile(f, list, i)));
    reveal([...container.children]);
  }

  // ---------- Visualizador ----------
  let lb, cur = [], idx = 0, timer = null;
  function buildLb() {
    lb = document.createElement('div');
    lb.className = 'lb'; lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Visualizador de fotos');
    lb.innerHTML = `<button class="lb-x" aria-label="Fechar">✕</button><button class="lb-nav lb-prev" aria-label="Anterior">‹</button>
      <figure><div class="lb-media"></div><figcaption><span class="lb-cap"></span><span class="lb-actions">
      <button class="chip" data-a="fav">♡ Favoritar</button><button class="chip" data-a="play">▶ Apresentar</button><a class="chip solid" data-a="dl" download>⬇ Baixar</a></span></figcaption></figure>
      <button class="lb-nav lb-next" aria-label="Próxima">›</button>`;
    document.body.appendChild(lb);
    $('.lb-x', lb).onclick = closeLb;
    $('.lb-prev', lb).onclick = () => go(-1);
    $('.lb-next', lb).onclick = () => go(1);
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
    $('[data-a=fav]', lb).onclick = () => toggleFav(cur[idx].id);
    $('[data-a=play]', lb).onclick = togglePlay;
    document.addEventListener('favs', () => { if (!lb.hidden) paintFav(); });
    addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key.toLowerCase() === 'f') toggleFav(cur[idx].id);
    });
  }
  function paintFav() { const b = $('[data-a=fav]', lb), on = isFav(cur[idx].id); b.textContent = on ? '♥ Favorita' : '♡ Favoritar'; b.classList.toggle('on', on); }
  function show() {
    const f = cur[idx], m = $('.lb-media', lb);
    m.classList.remove('swap'); void m.offsetWidth; m.classList.add('swap');
    m.innerHTML = f.video ? `<video src="${f.src}" controls autoplay playsinline></video>` : `<img src="${f.src}" alt="Foto ${f.n} do festival">`;
    $('.lb-cap', lb).textContent = `${idx + 1} / ${cur.length}${f.exemplo ? ' · exemplo' : ''}`;
    const dl = $('[data-a=dl]', lb);
    dl.hidden = !!f.exemplo; dl.href = f.src; dl.setAttribute('download', decodeURIComponent(f.src.split('/').pop()));
    paintFav();
  }
  function go(d) { idx = (idx + d + cur.length) % cur.length; show(); }
  function togglePlay() {
    const b = $('[data-a=play]', lb);
    if (timer) { clearInterval(timer); timer = null; b.textContent = '▶ Apresentar'; return; }
    timer = setInterval(() => { if (!cur[idx].video) go(1); }, 3500); b.textContent = '⏸ Pausar';
  }
  function closeLb() {
    lb.hidden = true; document.body.style.overflow = '';
    if (timer) togglePlay();
    $('.lb-media', lb).textContent = '';
  }
  function openLightbox(list, i) {
    if (!lb) buildLb();
    cur = list; idx = i; show(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-x', lb).focus();
  }


  // ---------- Transições de página: cada destino tem a sua, e a direção segue a ordem do menu ----------
  const html = document.documentElement;
  const ORDER = { home: 0, registros: 1, sobre: 2, pedir: 3 };
  const persona = (path) => { const f = path.split('/').pop().replace(/\.html$/, ''); return ORDER[f] !== undefined ? f : 'home'; };
  const here = page in ORDER ? page : 'home';
  const TXT = {
    home: `<span class="pt-ap">${APERTURE}</span><b>Início</b><small>abrindo o diafragma…</small>`,
    registros: '<b>Registros</b><small>▸ passando o rolo…</small>',
    sobre: '<span class="pt-pol"><i></i><em>Sobre</em></span>',
    pedir: '<span class="pt-env">✉️</span><b>Pedir fotos</b><span class="pt-bar"><i></i></span>',
  };
  const OUT = { home: 640, registros: 800, sobre: 700, pedir: 680 };
  function overlay(p, d, state) {
    const el = document.createElement('div');
    el.className = `pt pt-p-${p} pt-d-${d} ${state}`; el.setAttribute('aria-hidden', 'true');
    const slats = Array.from({ length: 10 }, (_, i) => `<i style="--n:${d === 'r' ? i : 9 - i}"><b>${String(i + 1).padStart(2, '0')}A</b></i>`).join('');
    el.innerHTML = `<div class="pt-bg"></div><div class="pt-slats">${slats}</div><div class="pt-box">${TXT[p]}</div>`;
    document.body.appendChild(el);
    return el;
  }
  const m1 = html.className.match(/pt-p-(\w+)/), m2 = html.className.match(/pt-d-(\w)/);
  if (html.classList.contains('pt-in') && m1) {
    const p = m1[1], d = m2 ? m2[1] : 'r';
    const el = overlay(p, d, 'covered');
    html.classList.add('pt-entering'); html.classList.remove('pt-in');
    try { sessionStorage.removeItem('pt'); } catch {}
    let opened = false;
    const open = () => {
      if (opened) return; opened = true;
      el.classList.replace('covered', 'open');
      setTimeout(() => { el.remove(); html.classList.remove('pt-entering', `pt-p-${p}`, `pt-d-${d}`); }, 1100);
    };
    requestAnimationFrame(() => requestAnimationFrame(open)); setTimeout(open, 90);
  }
  let leaving = null;
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || calm || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.protocol === 'mailto:' || (u.pathname === location.pathname && u.search === location.search)) return;
    e.preventDefault();
    if (leaving) return;
    const p = persona(u.pathname), d = ORDER[p] >= ORDER[here] ? 'r' : 'l';
    try { sessionStorage.setItem('pt', JSON.stringify({ p, d })); } catch {}
    leaving = overlay(p, d, 'close');
    setTimeout(() => { location.href = u.href; }, OUT[p]);
  });
  addEventListener('pageshow', (e) => { if (e.persisted && leaving) { leaving.remove(); leaving = null; try { sessionStorage.removeItem('pt'); } catch {} } });

  // ---------- Título que "revela" palavra por palavra ----------
  document.querySelectorAll('[data-split]').forEach((root) => {
    let i = 0;
    (function walk(n) {
      [...n.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.append(t); return; }
            const s = document.createElement('span');
            s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = t; frag.append(s);
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1) walk(c);
      });
    })(root);
  });

  // ---------- Contador que sobe ----------
  function count(el, alvo) {
    if (calm || !alvo) { el.textContent = alvo; return; }
    const run = () => {
      const t0 = performance.now();
      (function tick() {
        const k = Math.min(1, (performance.now() - t0) / 1400);
        el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      })();
    };
    el.textContent = '0';
    if (!('IntersectionObserver' in window)) return run();
    const o = new IntersectionObserver((es) => { if (es[0].isIntersecting) { o.disconnect(); run(); } });
    o.observe(el);
  }

  // ---------- Botões magnéticos e cards que inclinam (só com mouse) ----------
  if (!calm && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      const b = e.target.closest && e.target.closest('.btn, .shutter-btn');
      document.querySelectorAll('[data-mag]').forEach((x) => { if (x !== b) { x.style.translate = ''; delete x.dataset.mag; } });
      if (b) {
        const r = b.getBoundingClientRect();
        b.dataset.mag = 1;
        b.style.translate = `${(e.clientX - r.left - r.width / 2) * .22}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
      }
      const t = e.target.closest && e.target.closest('.roll');
      document.querySelectorAll('.roll[data-tilt]').forEach((x) => { if (x !== t) { x.style.removeProperty('--rx'); x.style.removeProperty('--ry'); delete x.dataset.tilt; } });
      if (t) {
        const r = t.getBoundingClientRect();
        t.dataset.tilt = 1;
        t.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 10 + 'deg');
        t.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 10 + 'deg');
      }
    }, { passive: true });
  }

  // ---------- Corações explodindo ----------
  function burst(el) {
    if (calm) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 9; i++) {
      const p = document.createElement('span');
      p.textContent = '♥'; p.className = 'burst';
      p.style.left = r.left + r.width / 2 + 'px'; p.style.top = r.top + r.height / 2 + 'px';
      document.body.appendChild(p);
      const a = (Math.PI * 2 * i) / 9 + Math.random() * .5, d = 40 + Math.random() * 40;
      p.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 20}px)) scale(1.2)`, opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => p.remove();
    }
  }

  // ---------- Cartões dos rolos (álbuns) ----------
  function renderRolls(container, albuns, withAll) {
    container.textContent = '';
    const mk = (href, no, emo, titulo, desc, n, cover, cls) => {
      const a = document.createElement('a');
      a.className = 'roll ' + (cls || ''); a.href = href;
      a.innerHTML = `<div class="cover">${cover ? `<img src="${cover}" alt="" loading="lazy">` : ''}</div>
        <span class="no">ROLO ${no}</span><span class="emo">${emo}</span>
        <div class="info"><h3>${titulo}</h3><p>${desc || ''}</p><span class="cnt">${n} quadro${n === 1 ? '' : 's'}</span></div>`;
      container.appendChild(a);
    };
    if (withAll) mk('registros.html#todos', '00', '🎞️', 'Todos os registros', 'Tudo junto, do começo ao fim do festival.', todas.length, (todas.find((f) => !f.video) || {}).src, 'all');
    albuns.forEach((al, i) => mk(`registros.html#${al.key}`, String(i + 1).padStart(2, '0'), al.emoji, al.titulo, al.desc, al.fotos.length, (al.fotos.find((f) => !f.video) || {}).src));
    reveal([...container.children]);
  }

  window.FC = { CFG, $, data, todas, isFav, toggleFav, favs: () => [...favs], toast, reveal, renderGrid, renderRolls, openLightbox, calm, APERTURE, count, burst };
  reveal([...document.querySelectorAll('[data-rv]')]);
})();
