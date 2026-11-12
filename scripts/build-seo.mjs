// Builds the indexable pages from assets/catalog.js:
//   series/<id>.html  one static page per series (served as /series/<id>)
//   sitemap.xml       every public page
// Run after every catalog change:  node scripts/build-seo.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.buckswood.art';

const sandbox = {window: {}, localStorage: {getItem: () => null}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/catalog.js'), 'utf8'), sandbox);
const {series} = sandbox.window.BW;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const iso = len => { const [m, s] = len.split(':').map(Number); return `PT${m}M${s}S`; };
const plural = n => n + (n === 1 ? ' episode' : ' episodes');

function page(s) {
  const url = `${SITE}/series/${s.id}`;
  const first = s.eps[0];
  const desc = `${s.hook} ${s.log}`;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TVSeries', '@id': url, name: s.title, url, description: s.log,
        image: `${SITE}/assets/microdramas/${s.cover}.jpg`, genre: s.tags, inLanguage: 'en',
        numberOfEpisodes: s.eps.length, startDate: first.date,
        productionCompany: {'@type': 'Organization', name: 'Buckswood Studios', url: SITE + '/'},
        trailer: {
          '@type': 'VideoObject', name: `${s.title} – Trailer`, description: s.hook,
          thumbnailUrl: [`${SITE}/assets/microdramas/${s.loop}.jpg`],
          uploadDate: first.date, duration: 'PT6S',
          contentUrl: `${SITE}/assets/microdramas/${s.loop}.mp4`
        },
        episode: s.eps.map(e => ({
          '@type': 'TVEpisode', episodeNumber: e.n, name: e.title,
          url: `${SITE}/watch#${e.id}`, datePublished: e.date, timeRequired: iso(e.len),
          image: `${SITE}/assets/microdramas/${e.poster}.jpg`
        }))
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Buckswood Studios', item: SITE + '/'},
          {'@type': 'ListItem', position: 2, name: s.title, item: url}
        ]
      }
    ]
  };
  const others = series.filter(o => o !== s);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="google-adsense-account" content="ca-pub-2272299323344536">
<title>${esc(s.title)} – Watch the microdrama | Buckswood Studios</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0C0C0D">
<link rel="canonical" href="${url}">
<meta property="og:type" content="video.tv_show">
<meta property="og:site_name" content="Buckswood Studios">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(s.title)} – Buckswood Studios">
<meta property="og:description" content="${esc(s.hook)}">
<meta property="og:image" content="${SITE}/assets/microdramas/${s.cover}.jpg">
<meta property="og:image:width" content="540">
<meta property="og:image:height" content="960">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/assets/mark.png">
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<link rel="stylesheet" href="/assets/consent.css">
<link rel="stylesheet" href="/assets/platform.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
.hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:clamp(24px,5vw,72px);align-items:center;padding-block:clamp(36px,6vw,72px)}
.crumbs{font-size:13px;color:var(--ash)}
.crumbs a{color:var(--ash);text-decoration:none}
.crumbs a:hover{color:var(--paper)}
.hero h1{font-size:clamp(46px,7vw,92px);font-weight:700;letter-spacing:-.035em;line-height:1;margin:14px 0}
.hero .hook{font-size:clamp(20px,2vw,26px);font-weight:600;letter-spacing:-.02em;line-height:1.2;margin:0;max-width:26ch}
.hero .log{color:var(--ash);margin:12px 0 0;max-width:58ch}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.acts{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
.trailer{width:clamp(200px,22vw,290px);aspect-ratio:9/16;max-width:100%;border-radius:14px;overflow:hidden;background:#000}
.trailer video{width:100%;height:100%;object-fit:cover}
.eplist{list-style:none;margin:0;padding:0;display:grid;gap:10px;max-width:820px}
.eplist a{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:16px;align-items:center;padding:10px;border-radius:14px;text-decoration:none;color:var(--paper);background:var(--film)}
.eplist a:hover{background:var(--grain)}
.eplist .th{aspect-ratio:9/16;border-radius:8px;overflow:hidden}
.eplist .th img{width:100%;height:100%;object-fit:cover}
.eplist b{display:block;font-weight:600;letter-spacing:-.015em}
.eplist small{color:var(--ash);font-size:13.5px}
.eplist .len{font-size:14px;color:var(--ash);font-variant-numeric:tabular-nums;padding-right:6px}
.others{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;max-width:520px}
@media (max-width:760px){.hero{grid-template-columns:1fr}.trailer{width:100%;max-width:340px}}
</style>
</head>
<body>

<header class="top">
  <div class="shell">
    <a class="brand" href="/"><img src="/assets/mark.png" alt="Buckswood Studios"><span>BUCKSWOOD</span></a>
    <nav class="tabs" aria-label="Main">
      <a href="/">Home</a>
      <a href="/#all" aria-current="page">Series</a>
      <a href="/#plans">Plans</a>
      <a href="/about">About</a>
    </nav>
    <div class="end"><a class="btn btn-spot btn-sm" href="/watch#${first.id}">Watch now</a></div>
  </div>
</header>

<main class="shell">
  <section class="hero">
    <div>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Buckswood Studios</a> / <a href="/#all">Series</a> / ${esc(s.title)}</nav>
      <h1>${esc(s.title)}</h1>
      <p class="hook">${esc(s.hook)}</p>
      <p class="log">${esc(s.log)}</p>
      <div class="tags">${s.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
      <div class="acts">
        <a class="btn btn-spot" href="/watch#${first.id}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>Play episode 1</a>
        <a class="btn" href="/#plans">Watch without ads</a>
      </div>
    </div>
    <div class="trailer"><video src="/assets/microdramas/${s.loop}.mp4" poster="/assets/microdramas/${s.loop}.jpg" muted loop playsinline autoplay preload="metadata" aria-label="${esc(s.title)} trailer"></video></div>
  </section>

  <section class="row" aria-labelledby="eps">
    <div class="row-head"><h2 id="eps">Episodes</h2><span class="label">${plural(s.eps.length)} · a new episode every day</span></div>
    <ol class="eplist">
${s.eps.map(e => `      <li><a href="/watch#${e.id}"><span class="th"><img src="/assets/microdramas/${e.poster}.jpg" alt="${esc(s.title)}, episode ${e.n}" loading="lazy" width="540" height="960"></span><span><small>Episode ${e.n} · <time datetime="${e.date}">${new Date(e.date + 'T12:00:00Z').toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})}</time></small><b>${esc(e.title)}</b></span><span class="len">${e.len}</span></a></li>`).join('\n')}
    </ol>
  </section>

  <section class="row" aria-labelledby="more">
    <div class="row-head"><h2 id="more">More series</h2></div>
    <div class="others">
${others.map(o => `      <a class="card reveal" href="/series/${o.id}"><div class="frame"><img class="still" src="/assets/microdramas/${o.cover}.jpg" alt="${esc(o.title)}" loading="lazy" width="540" height="960"><div class="cap"><b>${esc(o.title)}</b><small>${plural(o.eps.length)}</small></div></div></a>`).join('\n')}
    </div>
  </section>
</main>

<footer class="site">
  <div class="shell">
    <div>
      <a class="brand" href="/"><img src="/assets/mark.png" alt=""><span>BUCKSWOOD</span></a>
      <p>Original microdramas made with AI by Buckswood Studios. All characters and stories are fictional.</p>
    </div>
    <nav aria-label="Footer">
      <a href="/about">About &amp; partners</a>
      <a href="https://www.youtube.com/@Buckswood-Studios">YouTube</a>
      <a href="/agb">AGB</a>
      <a href="/widerruf">Widerruf</a>
      <a href="/kuendigen">Verträge hier kündigen</a>
      <a href="/impressum">Impressum</a>
      <a href="/datenschutz">Datenschutz</a>
      <button type="button" class="linkish" data-consent>Cookie settings</button>
    </nav>
  </div>
</footer>
<script src="/assets/consent.js"></script>
<script>if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelectorAll('video').forEach(function(v){v.removeAttribute('autoplay');v.pause()})</script>
</body>
</html>
`;
}

fs.mkdirSync(path.join(root, 'series'), {recursive: true});
for (const s of series) fs.writeFileSync(path.join(root, 'series', s.id + '.html'), page(s));

const latest = series.flatMap(s => s.eps.map(e => e.date)).sort().pop();
const urls = [
  {loc: '/', lastmod: latest, priority: '1.0'},
  ...series.map(s => ({loc: `/series/${s.id}`, lastmod: s.eps.map(e => e.date).sort().pop(), priority: '0.9'})),
  {loc: '/watch', lastmod: latest, priority: '0.7'},
  {loc: '/about', lastmod: latest, priority: '0.5'},
  {loc: '/editor', priority: '0.3'}
];
fs.writeFileSync(path.join(root, 'sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${SITE}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`);
console.log(`wrote ${series.length} series pages and sitemap.xml (${urls.length} urls)`);
