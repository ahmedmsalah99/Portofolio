// Ahmed Yousef portfolio: the HUD, the project grid and filters, the lock-on reticle,
// the project pages, the gallery lightbox and the terminal. Data: assets/projects.js.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.PROJECTS || [];
  const SK = window.SKILLS || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const M = 'assets/media/';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const id = i => 'P-' + String(i + 1).padStart(2, '0');
  const url = p => 'project.html?p=' + encodeURIComponent(p.slug);
  const SHORT = { drones: 'Drones', control: 'Control', slam: 'SLAM', vision: 'Vision', ai: 'AI', embedded: 'Embedded', software: 'Software' };
  const UPWORK = 'https://www.upwork.com/freelancers/~01a0793a19bbeb8d20';
  const FREELANCER = 'https://www.freelancer.com/u/ahmedsalah99hop';

  function video(name, { auto = false, cls = '' } = {}) {
    return `<video class="${cls}" muted loop playsinline preload="${auto ? 'auto' : 'none'}" ${auto && !reduce ? 'autoplay' : ''} poster="${M}${name}.jpg">
      <source src="${M}${name}.webm" type="video/webm"><source src="${M}${name}.mp4" type="video/mp4"></video>`;
  }
  function media(m, opts) {
    if (!m) return '';
    if (m.type === 'video') return video(m.src, opts);
    if (m.type === 'img') return `<img src="${M}${m.src}" alt="" loading="lazy" decoding="async">`;
    return `<div class="card__fig" aria-hidden="true">${esc(m.text)}</div>`;
  }

  /* ---------------------------------------------------------------- clock */
  const clock = $('[data-clock]');
  if (clock) {
    const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tick = () => { clock.textContent = f.format(new Date()) + ' GENOA'; };
    tick(); setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------- hero: the reel's HUD */
  const reel = $('.hero__reel');
  if (reel) {
    const label = $('[data-hud-label]'), alt = $('[data-hud-alt]'), spd = $('[data-hud-spd]');
    const cuts = [[0, 'TRACKING DRONE · HOLD IN WIND'], [6.2, 'PX4 SWARM · FORMATION FLIGHT'], [10.6, 'YOLOS-CPP · LIVE SEGMENTATION'], [15, 'RL SWARM · SARSA FLOCKING']];
    let a = 42.1, v = 3.2;
    setInterval(() => {
      const t = reel.currentTime || 0;
      label.textContent = cuts.filter(c => t >= c[0]).pop()[1];
      a = Math.max(8, a + (Math.random() - .5) * .8); v = Math.max(0, v + (Math.random() - .5) * .3);
      alt.textContent = a.toFixed(1).padStart(5, '0'); spd.textContent = v.toFixed(1).padStart(4, '0');
    }, 250);
    if (reduce) reel.pause();
  }
  const swap = $('[data-swap]');
  if (swap && !reduce) {
    const words = swap.dataset.swap.split('|'); let i = 1;
    setInterval(() => {
      const w = words[i++ % words.length]; let n = swap.textContent.length;
      const del = setInterval(() => {
        if (n > 0) { swap.textContent = swap.textContent.slice(0, --n); return; }
        clearInterval(del); let k = 0;
        const add = setInterval(() => { swap.textContent = w.slice(0, ++k); if (k >= w.length) clearInterval(add); }, 55);
      }, 30);
    }, 3200);
  }

  /* ---------------------------------------------------------------- home: filters and grid */
  const grid = $('[data-grid]');
  if (grid) {
    grid.innerHTML = P.map((p, i) => `
      <a class="card card--${p.size || 's'}" href="${url(p)}" data-skills="${p.skills.join(' ')}" data-lock="${id(i)} · ${esc(p.title.toUpperCase())}">
        <div class="card__media">${media(p.media)}</div>
        <div class="card__shade"></div>
        <span class="card__open">OPEN →</span>
        <div class="card__body">
          <div class="card__id"><span>${id(i)}</span><span>${esc(p.where)}</span></div>
          <h3>${esc(p.title)}</h3>
          <p class="card__tag">${esc(p.tagline)}</p>
          <div class="card__skills">${p.skills.map(s => `<span data-s="${s}">${esc(SHORT[s] || s)}</span>`).join('')}</div>
        </div>
      </a>`).join('');

    const filters = $('[data-filters]');
    const keys = Object.keys(SK);
    filters.innerHTML = `<button type="button" class="filter" data-f="all" aria-pressed="true"><kbd>0</kbd>All <small>${P.length}</small></button>` +
      keys.map((k, i) => `<button type="button" class="filter" data-f="${k}" aria-pressed="false"><kbd>${i + 1}</kbd>${esc(SK[k])} <small>${P.filter(p => p.skills.includes(k)).length}</small></button>`).join('');
    const shown = $('[data-shown]');
    const set = f => {
      $$('.filter', filters).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
      let n = 0;
      $$('.card', grid).forEach(c => {
        const hit = f === 'all' || c.dataset.skills.split(' ').includes(f);
        c.classList.toggle('is-off', !hit); c.style.order = hit ? 0 : 1; if (hit) n++;
        $$('[data-s]', c).forEach(s => s.classList.toggle('is-hit', s.dataset.s === f));
      });
      shown.textContent = n;
      history.replaceState(null, '', f === 'all' ? location.pathname + location.hash : '?skill=' + f + '#missions');
    };
    filters.addEventListener('click', e => { const b = e.target.closest('.filter'); if (b) set(b.dataset.f); });
    addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey || !$('.term').hidden || /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === '0') set('all');
      else if (e.key >= '1' && e.key <= String(keys.length)) set(keys[+e.key - 1]);
    });
    const q = location.search.match(/[?&]skill=(\w+)/);
    if (q && keys.includes(q[1])) set(q[1]);

    // clips play while their card is on screen (big cards) or under the pointer (all)
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = $('video', e.target); if (!v || reduce) return;
      if (e.isIntersecting && /card--(xl|l)/.test(e.target.className)) v.play().catch(() => {}); else v.pause();
    }), { threshold: .35 });
    $$('.card', grid).forEach(c => {
      io.observe(c);
      const v = $('video', c); if (!v) return;
      c.addEventListener('pointerenter', () => { if (!reduce) v.play().catch(() => {}); });
      c.addEventListener('pointerleave', () => { if (!/card--(xl|l)/.test(c.className)) v.pause(); });
    });
  }

  /* ---------------------------------------------------------------- project page */
  const page = $('[data-project]');
  if (page) {
    const slug = new URLSearchParams(location.search).get('p');
    const i = Math.max(0, P.findIndex(p => p.slug === slug));
    const p = P[i];
    const prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
    document.title = `${p.title} · Ahmed Yousef`;
    const hireLinks = `<a class="btn btn--upwork" href="${UPWORK}" target="_blank" rel="noopener">Hire me on Upwork</a><a class="btn btn--ghost" href="${FREELANCER}" target="_blank" rel="noopener">Freelancer</a>`;
    page.innerHTML = `
      <section class="p-hero"><div class="wrap">
        <a class="p-back" href="./#missions">← All projects</a>
        <div class="p-head">
          <div><p class="eyebrow">${id(i)} · ${esc(p.where)}${p.year ? ' · ' + esc(p.year) : ''}</p><h1>${esc(p.title)}</h1><p class="p-head__tag">${esc(p.tagline)}</p></div>
          <div class="p-head__meta">
            <div class="p-skills">${p.skills.map(s => `<a href="./?skill=${s}#missions">${esc(SK[s])}</a>`).join('')}</div>
            <div class="p-links">${p.links.map(([t, h]) => `<a class="btn btn--primary" href="${h}" target="_blank" rel="noopener">${esc(t)} ↗</a>`).join('')}${hireLinks}</div>
          </div>
        </div>
        <div class="p-stage">${media(p.media, { auto: true })}
          <div class="hud" aria-hidden="true"><span class="hud__corner hud__corner--tl"></span><span class="hud__corner hud__corner--tr"></span><span class="hud__corner hud__corner--bl"></span><span class="hud__corner hud__corner--br"></span>
            <div class="hud__tl"><span>${id(i)} · ${esc(p.title.toUpperCase())}</span><span class="hud__rec"><i></i>LIVE</span></div></div>
        </div>
        <div class="p-metrics">${p.metrics.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>
      </div></section>
      <section class="wrap p-body" id="brief">
        <div><h2>Mission brief</h2><p>${esc(p.summary)}</p>
          <div class="p-stack">${p.stack.map(s => `<span>${esc(s)}</span>`).join('')}</div>
          ${p.note ? `<p class="p-note">${esc(p.note)}</p>` : ''}</div>
        <div><h2>What I built</h2><ol class="p-built">${p.built.map(b => `<li>${esc(b)}</li>`).join('')}</ol></div>
      </section>
      ${p.gallery.length ? `<section class="wrap p-gallery"><h2>Gallery</h2><div class="gal">${p.gallery.map((g, k) => `
        <button type="button" data-k="${k}" aria-label="Enlarge: ${esc(g.alt)}">${g.type === 'video' ? video(g.src, { auto: true }) : `<img src="${M}${g.src}" alt="${esc(g.alt)}" loading="lazy">`}<figcaption>${esc(g.alt)}</figcaption></button>`).join('')}</div></section>` : ''}
      <nav class="wrap p-next" aria-label="More projects">
        <a href="${url(prev)}"><small>← Previous</small><strong>${esc(prev.title)}</strong></a>
        <a href="${url(next)}"><small>Next →</small><strong>${esc(next.title)}</strong></a>
      </nav>`;
    if (reduce) $$('video', page).forEach(v => { v.removeAttribute('autoplay'); v.pause(); });

    const lb = $('.lightbox'), stage = $('.lightbox__stage');
    const close = () => { lb.hidden = true; stage.textContent = ''; };
    page.addEventListener('click', e => {
      const b = e.target.closest('.gal button'); if (!b) return;
      const g = p.gallery[+b.dataset.k];
      stage.innerHTML = g.type === 'video' ? video(g.src, { auto: true }).replace('<video', '<video controls') : `<img src="${M}${g.src}" alt="${esc(g.alt)}">`;
      lb.hidden = false; $('.lightbox__close').focus();
    });
    $('.lightbox__close').addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && !lb.hidden) close();
      if (!lb.hidden || !$('.term').hidden || /input/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') location.href = url(prev);
      if (e.key === 'ArrowRight') location.href = url(next);
    });
  }

  /* ---------------------------------------------------------------- the lock-on reticle */
  const ret = $('.reticle');
  if (ret && fine && !reduce) {
    document.body.classList.add('has-reticle');
    const lab = $('.reticle__label');
    let x = -100, y = -100, lock = null, raf = 0;
    const draw = () => {
      raf = 0;
      if (lock && document.contains(lock)) {
        const r = lock.getBoundingClientRect(), pad = 6;
        ret.style.width = r.width + pad * 2 + 'px'; ret.style.height = r.height + pad * 2 + 'px';
        ret.style.transform = `translate3d(${r.left - pad}px, ${r.top - pad}px, 0)`;
      } else {
        ret.style.width = '34px'; ret.style.height = '34px';
        ret.style.transform = `translate3d(${x - 17}px, ${y - 17}px, 0)`;
      }
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(draw); };
    addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; x = e.clientX; y = e.clientY; ret.classList.add('is-on'); req(); }, { passive: true });
    addEventListener('scroll', req, { passive: true });
    document.addEventListener('pointerleave', () => ret.classList.remove('is-on'));
    document.addEventListener('pointerover', e => {
      const t = e.target.closest('.card, .platform, .p-next a, .gal button');
      if (t === lock) return;
      lock = t;
      ret.classList.toggle('is-lock', !!t);
      if (t) lab.textContent = 'LOCK · ' + (t.dataset.lock || t.querySelector('strong, .platform__name, figcaption')?.textContent || 'TARGET').toUpperCase();
      req();
    });
  }

  /* ---------------------------------------------------------------- the terminal (~) */
  const term = $('.term');
  if (term) {
    const out = $('[data-term-out]'), form = $('[data-term-form]'), input = $('#term-input');
    const root = location.pathname.includes('project.html') ? './' : '';
    const print = h => { out.insertAdjacentHTML('beforeend', h + '\n'); out.scrollTop = out.scrollHeight; };
    const open = () => {
      term.hidden = false;
      if (!out.textContent) print('<span class="c">AY-OS 1.0</span> · type <span class="a">help</span>');
      input.focus();
    };
    const shut = () => { term.hidden = true; };
    const cmds = {
      help: () => 'commands: <span class="a">whoami</span> <span class="a">ls</span> <span class="a">open &lt;n|name&gt;</span> <span class="a">skills</span> <span class="a">grep &lt;skill&gt;</span> <span class="a">hire</span> <span class="a">contact</span> <span class="a">sudo hire ahmed</span> <span class="a">clear</span> <span class="a">exit</span>',
      whoami: () => 'Ahmed Yousef · robotics and AI engineer · Genoa, Italy\nMSc Robotics Engineering (Genoa) · ~2.5 years professional C++ · freelancing since 2020',
      ls: () => P.map((p, i) => `<span class="c">${id(i)}</span>  <a href="${root}${url(p)}">${esc(p.slug)}</a>  ${esc(p.tagline)}`).join('\n'),
      skills: () => Object.entries(SK).map(([k, v]) => `<span class="c">${k.padEnd(9)}</span> ${esc(v)} (${P.filter(p => p.skills.includes(k)).length} projects)`).join('\n'),
      grep: a => { const k = Object.keys(SK).find(s => s.startsWith((a || '').toLowerCase())); if (!k) return 'grep: name a skill, e.g. grep slam'; location.href = `${root}./?skill=${k}#missions`; return `filtering by ${k}…`; },
      open: a => {
        const n = parseInt(String(a).replace(/\D/g, ''), 10);
        const p = !isNaN(n) && P[n - 1] ? P[n - 1] : P.find(p => p.slug.includes((a || '').toLowerCase()));
        if (!p) return 'open: no such project. try ls';
        location.href = root + url(p); return `opening ${p.slug}…`;
      },
      hire: () => `Upwork:     <a href="${UPWORK}" target="_blank" rel="noopener">${UPWORK}</a>\nFreelancer: <a href="${FREELANCER}" target="_blank" rel="noopener">${FREELANCER}</a>`,
      contact: () => 'email:    <a href="mailto:ahmed.msalah99@gmail.com">ahmed.msalah99@gmail.com</a>\ngithub:   <a href="https://github.com/ahmedmsalah99" target="_blank" rel="noopener">github.com/ahmedmsalah99</a>\nlinkedin: <a href="https://www.linkedin.com/in/ahmed-salah-a214a116a/" target="_blank" rel="noopener">linkedin.com/in/ahmed-salah-a214a116a</a>',
      sudo: a => /hire/.test(a || '') ? (setTimeout(() => window.open(UPWORK, '_blank', 'noopener'), 600), 'permission granted. opening Upwork…') : 'sudo: try "sudo hire ahmed"',
      clear: () => { out.textContent = ''; return ''; },
      exit: () => { shut(); return ''; },
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      const line = input.value.trim(); input.value = '';
      if (!line) return;
      print(`<span class="c">$</span> ${esc(line)}`);
      const [c, ...rest] = line.split(/\s+/);
      const fn = cmds[c.toLowerCase()];
      const r = fn ? fn(rest.join(' ')) : `${esc(c)}: command not found. try help`;
      if (r) print(r);
    });
    $$('[data-term-open]').forEach(b => b.addEventListener('click', open));
    $$('[data-term-close]').forEach(b => b.addEventListener('click', shut));
    term.addEventListener('click', e => { if (e.target === term) shut(); });
    addEventListener('keydown', e => {
      if ((e.key === '~' || e.key === '`') && term.hidden && !/input|textarea/i.test(e.target.tagName)) { e.preventDefault(); open(); }
      else if (e.key === 'Escape' && !term.hidden) shut();
    });
  }
})();
