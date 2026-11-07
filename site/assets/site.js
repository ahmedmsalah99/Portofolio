// Ahmed Yousef · portfolio behaviour. Data: assets/projects.js (window.PROJECTS, window.SKILLS).
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const P = window.PROJECTS || [];
  const SK = window.SKILLS || {};
  const KEYS = Object.keys(SK);
  const COLOR = { drones: '#ff5b1f', control: '#2346ff', slam: '#10b981', vision: '#e0306e', ai: '#f59e0b', embedded: '#0891b2', software: '#64748b' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = 'assets/media/';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const url = p => 'project.html?p=' + encodeURIComponent(p.slug);
  const UPWORK = 'https://www.upwork.com/freelancers/~01a0793a19bbeb8d20';
  const FREELANCER = 'https://www.freelancer.com/u/ahmedsalah99hop';

  const video = (name, { auto = false } = {}) =>
    `<video muted loop playsinline preload="${auto ? 'auto' : 'none'}" ${auto && !reduce ? 'autoplay' : ''} poster="${M}${name}.jpg"><source src="${M}${name}.webm" type="video/webm"><source src="${M}${name}.mp4" type="video/mp4"></video>`;
  const credit = m => m && m.credit ? `<figcaption class="credit">${m.page ? `<a href="${m.page}" target="_blank" rel="noopener">${esc(m.credit)}</a>` : esc(m.credit)}</figcaption>` : '';
  function media(m, p, opts) {
    if (!m) return '';
    if (m.type === 'video') return video(m.src, opts);
    if (m.type === 'img') return `<img src="${M}${m.src}" alt="${esc(m.alt || '')}" loading="lazy" decoding="async">`;
    return `<div class="card__fig" style="--c:${COLOR[p.skills[0]]}" aria-hidden="true">${esc(m.text)}</div>`;
  }

  /* ---------------------------------------------------------------- theme */
  const root = document.documentElement;
  const tbtn = $('[data-theme-toggle]');
  const syncTheme = () => { const d = root.dataset.theme === 'dark'; tbtn?.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); $('meta[name="theme-color"]')?.setAttribute('content', d ? '#0f1113' : '#f4f2ec'); };
  tbtn?.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {} syncTheme(); });
  syncTheme();

  /* ---------------------------------------------------------------- nav and eyes that follow the pointer */
  const nav = $('.nav');
  const onScroll = () => nav?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const logo = $('.logo__bot');
  const pupils = $$('[data-eye]');
  let raf = 0, px = 0, py = 0;
  addEventListener('pointermove', e => {
    px = e.clientX; py = e.clientY;
    if (raf || reduce) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (logo) { const r = logo.getBoundingClientRect(); const a = Math.atan2(py - (r.top + r.height / 2), px - (r.left + r.width / 2));
        logo.style.setProperty('--ex', (Math.cos(a) * 2).toFixed(2) + 'px'); logo.style.setProperty('--ey', (Math.sin(a) * 2).toFixed(2) + 'px'); }
      pupils.forEach(p => { const r = p.ownerSVGElement.getBoundingClientRect(); const s = r.width / 560;
        const cx = r.left + (+p.getAttribute('cx')) * s, cy = r.top + (+p.getAttribute('cy')) * s;
        const a = Math.atan2(py - cy, px - cx), d = Math.min(9, Math.hypot(px - cx, py - cy) / 40);
        p.style.transform = `translate(${(Math.cos(a) * d).toFixed(1)}px, ${(Math.sin(a) * d).toFixed(1)}px)`; });
    });
  }, { passive: true });

  /* ---------------------------------------------------------------- the rotating word */
  const rot = $('[data-rotate]');
  if (rot && !reduce) {
    const words = rot.dataset.rotate.split('|'); let i = 0;
    setInterval(() => {
      rot.classList.remove('is-in'); rot.classList.add('is-out');
      setTimeout(() => { i = (i + 1) % words.length; rot.textContent = words[i]; rot.classList.remove('is-out'); rot.classList.add('is-in'); }, 280);
    }, 2400);
  }

  /* ---------------------------------------------------------------- the project grid and filters */
  const grid = $('[data-grid]');
  let setFilter = () => {};
  if (grid) {
    grid.innerHTML = P.map(p => `
      <a class="card card--${p.size || 's'}" href="${url(p)}" data-skills="${p.skills.join(' ')}">
        <div class="card__media">${media(p.media, p)}</div>
        ${p.where ? `<span class="card__badge">${esc(p.where)}</span>` : ''}
        <span class="card__go" aria-hidden="true">→</span>
        <div class="card__body">
          <h3>${esc(p.title)}</h3>
          <p class="card__tag">${esc(p.tagline)}</p>
          <div class="card__skills">${p.skills.map(s => `<span data-s="${s}" style="--c:${COLOR[s]}">${esc(SK[s])}</span>`).join('')}</div>
        </div>
      </a>`).join('');
    const filters = $('[data-filters]');
    filters.innerHTML = `<button type="button" class="filter" data-f="all" aria-pressed="true">All <small>${P.length}</small></button>` +
      KEYS.map(k => `<button type="button" class="filter" data-f="${k}" aria-pressed="false" style="--c:${COLOR[k]}"><span class="dot"></span>${esc(SK[k])} <small>${P.filter(p => p.skills.includes(k)).length}</small></button>`).join('');
    const shown = $('[data-shown]');
    setFilter = (f, push = true) => {
      $$('.filter', filters).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.f === f)));
      let n = 0;
      $$('.card', grid).forEach(c => {
        const hit = f === 'all' || c.dataset.skills.split(' ').includes(f);
        c.classList.toggle('is-off', !hit); c.style.order = hit ? 0 : 1; if (hit) n++;
        $$('[data-s]', c).forEach(s => s.classList.toggle('is-hit', s.dataset.s === f));
      });
      shown.textContent = n;
      if (push) history.replaceState(null, '', f === 'all' ? 'index.html' + location.hash : 'index.html?skill=' + f + '#projects');
    };
    filters.addEventListener('click', e => { const b = e.target.closest('.filter'); if (b) setFilter(b.dataset.f); });
    const q = location.search.match(/[?&]skill=(\w+)/);
    if (q && KEYS.includes(q[1])) setFilter(q[1], false);

    const big = c => /card--(xl|l)\b/.test(c.className);
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = $('video', e.target); if (!v || reduce) return;
      if (e.isIntersecting && big(e.target)) v.play().catch(() => {}); else v.pause();
    }), { threshold: .4 });
    $$('.card', grid).forEach(c => {
      io.observe(c);
      const v = $('video', c); if (!v) return;
      c.addEventListener('pointerenter', () => { if (!reduce) v.play().catch(() => {}); });
      c.addEventListener('pointerleave', () => { if (!big(c)) v.pause(); });
    });
  }

  /* ---------------------------------------------------------------- the robot: parts are skills */
  const bot = $('.bot');
  if (bot) {
    const card = { skill: $('[data-bot-skill]'), n: $('[data-bot-n]'), list: $('[data-bot-list]'), go: $('[data-bot-go]') };
    const parts = $$('.part', bot);
    let pinned = null;
    const show = k => {
      parts.forEach(p => p.classList.toggle('is-on', p.dataset.skill === k));
      bot.classList.toggle('is-focus', !!k);
      if (!k) { card.skill.textContent = 'Hover the robot'; card.n.textContent = 'Each part is a skill, backed by real projects.'; card.list.innerHTML = ''; card.go.hidden = true; return; }
      const ps = P.filter(p => p.skills.includes(k));
      card.skill.textContent = SK[k];
      card.n.textContent = `${ps.length} projects prove it:`;
      card.list.innerHTML = ps.slice(0, 6).map(p => `<li><a href="${url(p)}">${esc(p.title)}</a></li>`).join('') + (ps.length > 6 ? `<li><a href="index.html?skill=${k}#projects">+${ps.length - 6} more</a></li>` : '');
      card.go.hidden = false; card.go.dataset.k = k;
    };
    parts.forEach(p => {
      if (p.getAttribute('aria-hidden') === 'true') return;
      p.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(p.dataset.skill); });
      p.addEventListener('focus', () => show(p.dataset.skill));
      p.addEventListener('click', () => { pinned = p.dataset.skill; show(pinned); });
      p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pinned = p.dataset.skill; show(pinned); } });
    });
    $('.bot__svg').addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') show(pinned); });
    card.go.addEventListener('click', () => { setFilter(card.go.dataset.k); $('#projects').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
    if (!reduce) { // a short tour on load so people see the robot is interactive
      const tour = ['vision', 'slam', 'control']; let i = 0;
      const t = setInterval(() => { if (pinned || bot.matches(':hover')) { clearInterval(t); return; } if (i < tour.length) show(tour[i++]); else { show(null); clearInterval(t); } }, 1400);
      setTimeout(() => { if (!pinned && !bot.matches(':hover')) show('vision'); }, 900);
    }
  }

  /* ---------------------------------------------------------------- showreel */
  const reel = $('[data-reel]');
  if (reel) {
    const btn = $('[data-reel-toggle]'), chaps = $$('.reel__chapters li');
    let userPaused = reduce;
    const sync = () => { btn.classList.toggle('is-paused', reel.paused); btn.setAttribute('aria-label', reel.paused ? 'Play the showreel' : 'Pause the showreel'); };
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !userPaused) reel.play().catch(() => {}); else reel.pause(); }, { threshold: .3 }).observe(reel);
    btn.addEventListener('click', () => { userPaused = !reel.paused; reel.paused ? reel.play() : reel.pause(); });
    reel.addEventListener('play', sync); reel.addEventListener('pause', sync); sync();
    reel.addEventListener('timeupdate', () => { const t = reel.currentTime; let on = 0; chaps.forEach((c, i) => { if (t >= +c.dataset.at) on = i; }); chaps.forEach((c, i) => c.classList.toggle('is-on', i === on)); });
  }

  /* ---------------------------------------------------------------- project page */
  const page = $('[data-project]');
  if (page) {
    const slug = new URLSearchParams(location.search).get('p');
    const i = Math.max(0, P.findIndex(p => p.slug === slug));
    const p = P[i];
    const prev = P[(i - 1 + P.length) % P.length], next = P[(i + 1) % P.length];
    document.title = `${p.title} · Ahmed Yousef`;
    const related = P.filter(q => q !== p && q.skills.some(s => p.skills.includes(s))).slice(0, 3);
    const gal = p.gallery || [];
    page.innerHTML = `
      <section class="wrap p-top">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html#projects">← All projects</a>${p.skills.slice(0, 1).map(s => `<a href="index.html?skill=${s}#projects">${esc(SK[s])}</a>`).join('')}</nav>
        <div class="p-head">
          <div><p class="kicker">${esc(p.where)}${p.year ? ' · ' + esc(p.year) : ''}</p><h1>${esc(p.title)}</h1><p class="p-head__tag">${esc(p.tagline)}</p></div>
          <div class="p-side">
            <div class="p-skills">${p.skills.map(s => `<a href="index.html?skill=${s}#projects" style="--c:${COLOR[s]}">${esc(SK[s])}</a>`).join('')}</div>
            <div class="p-links">${p.links.map(([t, h]) => `<a class="btn btn--primary" href="${h}" target="_blank" rel="noopener">${esc(t)} <span aria-hidden="true">↗</span></a>`).join('')}
              <a class="btn btn--upwork" href="${UPWORK}" target="_blank" rel="noopener">Hire me for this</a></div>
          </div>
        </div>
        <figure class="p-stage" style="margin:0">${media(p.media, p, { auto: true })}${credit(p.media)}</figure>
        <div class="p-metrics">${p.metrics.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div>
      </section>
      <section class="wrap p-body" id="brief">
        <div><h2>The brief</h2><p>${esc(p.summary)}</p>
          <div class="p-stack">${p.stack.map(s => `<span>${esc(s)}</span>`).join('')}</div>
          ${p.note ? `<p class="p-note">${esc(p.note)}</p>` : ''}</div>
        <div><h2>What I built</h2><ol class="p-built">${p.built.map(b => `<li>${esc(b)}</li>`).join('')}</ol></div>
      </section>
      ${gal.length ? `<section class="wrap p-gallery"><h2>Gallery</h2><div class="gal">${gal.map((g, k) => `
        <button type="button" data-k="${k}" aria-label="Enlarge: ${esc(g.alt)}">${g.type === 'video' ? video(g.src, { auto: true }) : `<img class="${g.contain ? 'contain' : ''}" src="${M}${g.src}" alt="${esc(g.alt)}" loading="lazy">`}
          <span class="cap">${esc(g.alt)}${g.credit ? `<small>${esc(g.credit)}</small>` : ''}</span></button>`).join('')}</div></section>` : ''}
      <section class="wrap p-more">
        ${related.length ? `<h2>Related projects</h2><div class="grid grid--related">${related.map(q => `
          <a class="card card--m" href="${url(q)}"><div class="card__media">${media(q.media, q)}</div><span class="card__go" aria-hidden="true">→</span>
          <div class="card__body"><h3>${esc(q.title)}</h3><p class="card__tag">${esc(q.tagline)}</p></div></a>`).join('')}</div>` : ''}
        <nav class="p-next" aria-label="Previous and next project" style="margin-top:32px">
          <a href="${url(prev)}"><small>← Previous</small><strong>${esc(prev.title)}</strong></a>
          <a href="${url(next)}"><small>Next →</small><strong>${esc(next.title)}</strong></a>
        </nav>
      </section>`;
    if (reduce) $$('video', page).forEach(v => { v.removeAttribute('autoplay'); v.pause(); });
    $$('.grid--related .card video', page).forEach(v => { const c = v.closest('.card'); c.addEventListener('pointerenter', () => v.play().catch(() => {})); c.addEventListener('pointerleave', () => v.pause()); });

    const lb = $('.lightbox'), stage = $('.lightbox__stage');
    const close = () => { lb.hidden = true; stage.textContent = ''; };
    page.addEventListener('click', e => {
      const b = e.target.closest('.gal button'); if (!b) return;
      const g = gal[+b.dataset.k];
      stage.innerHTML = g.type === 'video' ? video(g.src, { auto: true }).replace('<video', '<video controls') : `<img src="${M}${g.src}" alt="${esc(g.alt)}">`;
      lb.hidden = false; $('.lightbox__close').focus();
    });
    $('.lightbox__close').addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && !lb.hidden) return close();
      if (!lb.hidden || /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') location.href = url(prev);
      if (e.key === 'ArrowRight') location.href = url(next);
    });
  }

  /* ---------------------------------------------------------------- credits page */
  const cl = $('[data-credits]');
  if (cl) {
    const items = [];
    P.forEach(p => [p.media, ...(p.gallery || [])].forEach(m => { if (m && m.credit && !items.some(x => x.src === m.src)) items.push({ ...m, project: p }); }));
    cl.innerHTML = items.map(m => `<li><a href="${m.page}" target="_blank" rel="noopener">${esc(m.alt || m.src)}</a><br><small>${esc(m.credit)} · used on <a href="${url(m.project)}">${esc(m.project.title)}</a></small></li>`).join('');
  }
})();
