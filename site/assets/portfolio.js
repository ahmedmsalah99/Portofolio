// The switchboard, the project filter, the pointer preview and the keyboard shortcuts.
// One state: the chosen skill ("all" or a skill id). Switches, chips, keys 1-7 (0 for all) and
// #skill=<id> links all set it; the hero stage, the index and the URL follow.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const media = 'assets/media/';

const rows = $$('[data-index] > li');
const switches = $$('.switch');
const chips = $$('.chip');
const proofs = $$('.proof');
const shown = $('[data-shown]');
const pauseBtn = $('.stage-pause');
let paused = reduce;
let skill = 'all';

/* counts on the switches, from the index itself */
for (const el of $$('[data-count]')) {
  const n = rows.filter(r => r.dataset.skills.split(' ').includes(el.dataset.count)).length;
  el.textContent = n + (n === 1 ? ' project' : ' projects');
}

/* the stage: show one layer, load its media the first time, play only it */
function sources(v, name) {
  for (const [ext, type] of [['webm', 'video/webm'], ['mp4', 'video/mp4']]) {
    const s = document.createElement('source'); s.src = media + name + '.' + ext; s.type = type; v.append(s);
  }
  v.load();
}
function load(el) {
  for (const m of $$('img[data-src]', el)) { m.src = m.dataset.src; delete m.dataset.src; }
  for (const v of $$('video[data-clip]', el)) { sources(v, v.dataset.clip); delete v.dataset.clip; }
}
function stage(id) {
  const layer = proofs.find(p => p.dataset.proof === id) || proofs[0];
  load(layer);
  for (const p of proofs) {
    const on = p === layer;
    p.classList.toggle('is-on', on);
    for (const v of $$('video', p)) { if (on) { if (!paused) v.play().catch(() => {}); } else v.pause(); }
  }
  pauseBtn.hidden = !$('video', layer);
}

/* the filter: matching rows stay lit, the rest dim (hidden on a phone) */
function filter(id) {
  let n = 0;
  for (const r of rows) {
    const hit = id === 'all' || r.dataset.skills.split(' ').includes(id);
    r.classList.toggle('is-dim', !hit);
    r.classList.toggle('is-hit', hit && id !== 'all');
    if (hit) n++;
  }
  shown.textContent = n;
  $('[data-index]').classList.toggle('is-all', id === 'all');
}

function set(id, { from } = {}) {
  skill = id;
  for (const b of switches) b.setAttribute('aria-pressed', String(b.dataset.skill === id));
  for (const c of chips) c.setAttribute('aria-pressed', String(c.dataset.skill === id));
  stage(id);
  filter(id);
  const url = location.pathname + (id === 'all' ? '' : '?skill=' + id) + (location.hash.startsWith('#skill=') ? '' : location.hash);
  if (from !== 'hash') history.replaceState(null, '', url);
}

/* a switch toggles its skill; hovering one previews its proof without filtering */
for (const b of switches) {
  b.addEventListener('click', () => set(skill === b.dataset.skill ? 'all' : b.dataset.skill));
  b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') stage(b.dataset.skill); });
  b.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') stage(skill); });
  b.addEventListener('focus', () => stage(b.dataset.skill));
  b.addEventListener('blur', () => stage(skill));
}
for (const c of chips) c.addEventListener('click', () => set(c.dataset.skill));

/* keys: 1-7 pick a skill, 0 or Escape shows all (never while typing) */
const order = switches.map(b => b.dataset.skill);
addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName) || e.target.isContentEditable) return;
  if (e.key >= '1' && e.key <= String(order.length)) set(order[+e.key - 1]);
  else if (e.key === '0' || (e.key === 'Escape' && skill !== 'all')) set('all');
});

/* #skill=<id> links (the footer shortcuts, a link a recruiter shares) */
function fromHash(scroll) {
  const m = location.hash.match(/^#skill=(\w+)/) || location.search.match(/[?&]skill=(\w+)/);
  if (!m || !order.includes(m[1])) return;
  set(m[1], { from: 'hash' });
  if (scroll) $('#projects').scrollIntoView();
}
addEventListener('hashchange', () => fromHash(true));
fromHash(true);

/* the pause button holds every clip on the stage */
pauseBtn.setAttribute('aria-pressed', String(paused));
pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.setAttribute('aria-pressed', String(paused));
  pauseBtn.setAttribute('aria-label', paused ? 'Play the video' : 'Pause the video');
  for (const v of $$('.proof.is-on video')) paused ? v.pause() : v.play().catch(() => {});
});
if (reduce) for (const v of $$('.proof video')) { v.removeAttribute('autoplay'); v.pause(); }

/* the pointer preview over the index (mouse only; CSS hides it on touch) */
const peek = $('.peek');
const frame = $('.peek__frame');
const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
let cur = null, x = 0, y = 0, raf = 0;
function fill(r) {
  frame.textContent = '';
  if (r.dataset.media) {
    const name = r.dataset.media;
    if (r.dataset.mediaKind === 'img') {
      const i = new Image(); i.src = media + name + '.jpg'; i.alt = ''; frame.append(i);
    } else {
      const v = document.createElement('video');
      Object.assign(v, { poster: media + name + '.jpg', muted: true, loop: true, playsInline: true });
      sources(v, name); frame.append(v); if (!reduce) v.play().catch(() => {});
    }
  } else {
    const f = document.createElement('div'); f.className = 'peek__fig'; f.textContent = r.dataset.figure || ''; frame.append(f);
  }
}
function place() {
  raf = 0;
  const w = peek.offsetWidth, h = peek.offsetHeight;
  const px = Math.min(x + 24, innerWidth - w - 16), py = Math.min(Math.max(y - h / 2, 88), innerHeight - h - 16);
  peek.style.transform = `translate3d(${px}px, ${py}px, 0)`;
}
for (const r of rows) {
  r.addEventListener('pointerenter', e => {
    if (!fine.matches || e.pointerType !== 'mouse' || r.classList.contains('is-dim')) return;
    if (cur !== r) { cur = r; fill(r); }
    peek.classList.add('is-on');
  });
  r.addEventListener('pointerleave', () => { peek.classList.remove('is-on'); });
}
addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(place); }, { passive: true });

set(skill, { from: 'hash' });
