// HTML builders shared by the browser (site.js) and the build script (tools/build.mjs), so the static
// pages search engines read and the live pages are the same markup. Data: assets/projects.js.
(function (root) {
  const P = () => root.PROJECTS || [];
  const SK = () => root.SKILLS || {};
  const COLOR = { drones: '#ff5b1f', control: '#2346ff', slam: '#10b981', vision: '#e0306e', ai: '#f59e0b', embedded: '#0891b2', software: '#64748b' };
  const UPWORK = 'https://www.upwork.com/freelancers/~01a0793a19bbeb8d20';
  const M = 'assets/media/';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const url = p => p.slug + '.html';
  // every media URL carries the deploy's version, so a new deploy is never hidden by the browser cache
  const ver = () => root.ASSET_VERSION || 'ASSETVER';
  const src = path => `${M}${path}?v=${ver()}`;

  const video = (name, { auto = false } = {}) =>
    `<video muted loop playsinline preload="${auto ? 'auto' : 'none'}"${auto ? ' autoplay' : ''} poster="${src(name + '.jpg')}"><source src="${src(name + '.webm')}" type="video/webm"><source src="${src(name + '.mp4')}" type="video/mp4"></video>`;
  const credit = m => m && m.credit ? `<figcaption class="credit">${m.page ? `<a href="${m.page}" target="_blank" rel="noopener">${esc(m.credit)}</a>` : esc(m.credit)}</figcaption>` : '';
  function media(m, p, opts) {
    if (!m) return '';
    if (m.type === 'video') return video(m.src, opts);
    if (m.type === 'img') return `<img src="${src(m.src)}" alt="${esc(m.alt || p.title)}" loading="lazy" decoding="async">`;
    return `<div class="card__fig" style="--c:${COLOR[p.skills[0]]}" aria-hidden="true">${esc(m.text)}</div>`;
  }

  const card = p => `
      <a class="card card--${p.size || 's'}" href="${url(p)}" data-skills="${p.skills.join(' ')}">
        <div class="card__media">${media(p.media, p)}</div>
        ${p.where ? `<span class="card__badge">${esc(p.where)}</span>` : ''}
        <span class="card__go" aria-hidden="true">→</span>
        <div class="card__body">
          <h3>${esc(p.title)}</h3>
          <p class="card__tag">${esc(p.tagline)}</p>
          <div class="card__skills">${p.skills.map(s => `<span data-s="${s}" style="--c:${COLOR[s]}">${esc(SK()[s])}</span>`).join('')}</div>
        </div>
      </a>`;
  const grid = () => P().map(card).join('');

  function project(p) {
    const all = P(), sk = SK(), i = all.indexOf(p);
    const prev = all[(i - 1 + all.length) % all.length], next = all[(i + 1) % all.length];
    const related = all.filter(q => q !== p && q.skills.some(s => p.skills.includes(s))).slice(0, 3);
    const gal = p.gallery || [];
    const D = (root.DETAILS || {})[p.slug];
    return `
      <section class="wrap p-top">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html#projects">← All projects</a>${p.skills.slice(0, 1).map(s => `<a href="index.html?skill=${s}#projects">${esc(sk[s])}</a>`).join('')}</nav>
        <div class="p-head">
          <div><p class="kicker">${esc(p.where)}${p.year ? ' · ' + esc(p.year) : ''}</p><h1>${esc(p.title)}</h1><p class="p-head__tag">${esc(p.tagline)}</p></div>
          <div class="p-side">
            <div class="p-skills">${p.skills.map(s => `<a href="index.html?skill=${s}#projects" style="--c:${COLOR[s]}">${esc(sk[s])}</a>`).join('')}</div>
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
      ${D ? `<section class="wrap p-how"><h2>How it works</h2><ol class="flow">${D.how.map(([t, d], k) => `<li><span class="flow__n">${k + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('')}</ol>
        ${D.decisions ? `<div class="p-dec"><h2>Engineering decisions</h2><ul>${D.decisions.map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>` : ''}</section>` : ''}
      ${gal.length ? `<section class="wrap p-gallery"><h2>Gallery</h2><div class="gal">${gal.map((g, k) => `
        <button type="button" data-k="${k}" aria-label="Enlarge: ${esc(g.alt)}">${g.type === 'video' ? video(g.src, { auto: true }) : `<img class="${g.contain ? 'contain' : ''}" src="${src(g.src)}" alt="${esc(g.alt)}" loading="lazy">`}
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
  }

  root.R = { COLOR, UPWORK, M, esc, url, src, video, media, credit, card, grid, project };
})(typeof window !== 'undefined' ? window : globalThis);
