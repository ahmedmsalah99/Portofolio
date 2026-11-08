// Pre-renders the site for search engines and speed. Run from the repository root:  node tools/build.mjs
//  - writes site/<slug>.html for every project (own title, description, canonical, Open Graph, JSON-LD, full content)
//  - fills the project grid in site/index.html and the list in site/credits.html
//  - writes site/sitemap.xml and site/robots.txt
// Re-run it after editing site/assets/projects.js. The deploy workflow runs it too, so the live site never lags.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SITE = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'site');
const BASE = 'https://ahmedmsalah99.github.io/Portofolio/';
const read = f => fs.readFileSync(path.join(SITE, f), 'utf8');
const write = (f, s) => fs.writeFileSync(path.join(SITE, f), s);

const ctx = { console };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['assets/projects.js', 'assets/render.js']) vm.runInContext(read(f).replace(/\bwindow\./g, 'globalThis.'), ctx, { filename: f });
const { PROJECTS: P, SKILLS: SK, R } = ctx;
const { esc } = R;
const attr = s => esc(s).replace(/\n/g, ' ');

// ------------------------------------------------------------------ project pages
const tpl = read('project.html');
const today = new Date().toISOString().slice(0, 10);
const ogImage = p => {
  const m = p.media || {};
  if (m.type === 'video') return BASE + 'assets/media/' + m.src + '.jpg';
  if (m.type === 'img' && /\.(jpe?g|png)$/i.test(m.src)) return BASE + 'assets/media/' + m.src;
  return BASE + 'assets/media/reel.jpg';
};
for (const p of P) {
  const url = BASE + p.slug + '.html';
  const title = `${p.title} · ${p.skills.map(s => SK[s]).slice(0, 2).join(', ')} | Ahmed Yousef`;
  const desc = `${p.tagline} ${p.summary}`.slice(0, 300);
  const code = p.links.find(([, h]) => /github\.com/.test(h));
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': code ? 'SoftwareSourceCode' : 'CreativeWork', name: p.title, headline: p.tagline, description: p.summary, url,
        image: ogImage(p), keywords: [...p.skills.map(s => SK[s]), ...p.stack].join(', '),
        author: { '@type': 'Person', '@id': BASE + '#ahmed', name: 'Ahmed Yousef', url: BASE },
        ...(code ? { codeRepository: code[1] } : {}),
        ...(p.year && /^\d{4}$/.test(p.year) ? { dateCreated: p.year } : {}),
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Projects', item: BASE + '#projects' },
          { '@type': 'ListItem', position: 2, name: p.title, item: url },
        ],
      },
    ],
  };
  const head = `<title>${esc(title)}</title>
<meta name="description" content="${attr(desc)}">
<meta name="author" content="Ahmed Yousef">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Ahmed Yousef">
<meta property="og:title" content="${attr(p.title + ' · Ahmed Yousef')}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage(p)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(p.title + ' · Ahmed Yousef')}">
<meta name="twitter:description" content="${attr(desc)}">
<meta name="twitter:image" content="${ogImage(p)}">
<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
  let s = tpl
    .replace(/<title>[\s\S]*?<meta name="theme-color"/, head + '\n<meta name="theme-color"')
    .replace('<meta name="robots" content="noindex, follow">\n', '')
    .replace(/<main data-project>[\s\S]*?<\/main>/, `<main data-project data-slug="${p.slug}">${R.project(p)}\n</main>`);
  write(p.slug + '.html', s);
}

// ------------------------------------------------------------------ home grid and credits list
let home = read('index.html');
home = home.replace(/<!--grid:start-->[\s\S]*?<!--grid:end-->/, `<!--grid:start-->${R.grid()}\n      <!--grid:end-->`);
write('index.html', home);

const items = [];
P.forEach(p => [p.media, ...(p.gallery || [])].forEach(m => { if (m && m.credit && m.page && !items.some(x => x.src === m.src)) items.push({ ...m, project: p }); }));
let credits = read('credits.html');
credits = credits.replace(/<ul class="credits-list" data-credits>[\s\S]*?<\/ul>/, `<ul class="credits-list" data-credits>${items.map(m => `
    <li><a href="${m.page}" target="_blank" rel="noopener">${esc(m.alt || m.src)}</a><br><small>${esc(m.credit)} · used on <a href="${R.url(m.project)}">${esc(m.project.title)}</a></small></li>`).join('')}
  </ul>`);
write('credits.html', credits);

// ------------------------------------------------------------------ sitemap and robots
const urls = [[BASE, '1.0'], ...P.map(p => [BASE + p.slug + '.html', p.size === 's' ? '0.6' : '0.8']), [BASE + 'credits.html', '0.2']];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, pr]) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /Portofolio/project.html\n\nSitemap: ${BASE}sitemap.xml\n`);
console.log(`built ${P.length} project pages, home grid, credits list, sitemap (${urls.length} URLs) and robots.txt`);
