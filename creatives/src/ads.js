// Arabiva ad creatives — composed from the store's own photos (unaltered) + text layers.
// Usage: node ads.js [filter]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = __dirname;
const F = (p) => 'file://' + path.join(ROOT, p);

const SIZES = { sq: { w: 1200, h: 1200 }, land: { w: 1200, h: 628 }, port: { w: 960, h: 1200 }, story: { w: 1080, h: 1920 } };
const FACTS = JSON.parse(fs.readFileSync(path.join(ROOT, 'facts.json'), 'utf8'));
const KW = FACTS;
// Photo placement per format. layout: side | stack | grid. track = px size of the photo track. fit: contain keeps the whole photo.
const WHITE = { sq: { layout: 'stack', track: 640 }, land: { layout: 'side', track: 470 }, port: { layout: 'stack', track: 600 }, story: { layout: 'stack', track: 960 } };
const SQUARE_SCENE = { sq: { layout: 'grid', track: 690 }, land: { layout: 'side', track: 628 }, port: { layout: 'stack', track: 720, fit: 'contain' }, story: { layout: 'stack', track: 1080 } };
const CONCEPTS = {
  tola: { kind: 'white', img: 'img/tola.webp', bg: '#fefcfb', fmt: WHITE,
    ar: { eyebrow: 'تولة أرابيفا', h: 'جرّب عطرك<br>من <b>1 د.ك</b>', sub: 'أكثر من 2,000 عطر مستوحى، مسك وعود. اختر رائحتك وجرّبها قبل الحجم الكبير.', chips: KW.ar.chips },
    en: { eyebrow: 'Arabiva Tola', h: 'Try your scent<br>from <b>KWD 1</b>', sub: '2,000+ inspired fragrances, musk and oud. Start small, then size up.', chips: KW.en.chips } },
  spray: { kind: 'scene', img: 'img/arch.webp', fmt: SQUARE_SCENE,
    ar: { eyebrow: 'بخاخ العطر', h: 'بخاخ 50 مل<br>من <b>6 د.ك</b>', sub: 'وعيّنة 2 مل من 1 د.ك: جرّب الرائحة أولاً، ثم اطلب حجمك.', chips: KW.ar.chips },
    en: { eyebrow: 'Perfume spray', h: '50 ml spray<br>from <b>KWD 6</b>', sub: '2 ml samples from KWD 1. Try the scent first, then pick your size.', chips: KW.en.chips } },
  oil: { kind: 'ladder', bg: '#fefefe', fmt: { sq: { layout: 'stack', track: 600 }, land: { layout: 'side', track: 690 }, port: { layout: 'stack', track: 600 }, story: { layout: 'stack', track: 960 } },
    ladder: [['img/c-50g.webp', 0.50, '50 غ', '50 g'], ['img/c-100g.webp', 0.60, '100 غ', '100 g'], ['img/c-250g.webp', 0.72, '250 غ', '250 g'], ['img/c-500g.webp', 0.86, '500 غ', '500 g'], ['img/c-1kg.webp', 1.0, '1 كغ', '1 kg']],
    ar: { eyebrow: 'زيوت عطرية مركّزة', h: '50 غرام<br>من <b>2 د.ك</b>', sub: 'أحجام من 50 غرام إلى 1 كيلو. مخلوطة ومعبأة في مختبرنا بالكويت.', chips: KW.ar.chips_oil },
    en: { eyebrow: 'Concentrated perfume oils', h: '50 g<br>from <b>KWD 2</b>', sub: 'Sizes from 50 g to 1 kg. Blended and bottled in our Kuwait lab.', chips: KW.en.chips_oil } },
  ignis: { kind: 'scene', img: 'img/ignis.webp', fmt: SQUARE_SCENE,
    ar: { eyebrow: 'سيجنتشر كوليكشن', h: 'إغنيس', sub: 'إكستريه دو بارفان، 50 مل. عطر من دار كويتية بتوقيع أرابيفا.', chips: KW.ar.chips } },
  travel: { kind: 'scene', fmt: { sq: { layout: 'stack', track: 650, img: 'img/travel-wide.webp', pos: '50% 56%' }, land: { layout: 'side', track: 503, img: 'img/travel-mobile.webp' }, port: { layout: 'stack', track: 720, img: 'img/travel-wide.webp' }, story: { layout: 'stack', track: 1120, img: 'img/travel-mobile.webp', pos: '50% 60%' } },
    ar: { eyebrow: 'بخاخ السفر', h: 'عطرك معك<br>10 مل من <b>2.5 د.ك</b>', sub: 'اختر أي عطر بحجم السفر. لفّة واحدة ويظهر البخاخ.', chips: KW.ar.chips } },
};

const css = `
@font-face{font-family:Alexandria;font-weight:300;src:url(${F('fonts/alexandria-arabic-300-normal.woff2')}) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC}
@font-face{font-family:Alexandria;font-weight:300;src:url(${F('fonts/alexandria-latin-300-normal.woff2')}) format('woff2')}
@font-face{font-family:Alexandria;font-weight:500;src:url(${F('fonts/alexandria-arabic-500-normal.woff2')}) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC}
@font-face{font-family:Alexandria;font-weight:500;src:url(${F('fonts/alexandria-latin-500-normal.woff2')}) format('woff2')}
@font-face{font-family:Alexandria;font-weight:800;src:url(${F('fonts/alexandria-arabic-800-normal.woff2')}) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC}
@font-face{font-family:Alexandria;font-weight:800;src:url(${F('fonts/alexandria-latin-800-normal.woff2')}) format('woff2')}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#14110f}
.ad{position:relative;overflow:hidden;display:grid;font-family:Alexandria,sans-serif;color:#faf4ec;background:#14110f}
.ad.side{grid-template-columns:var(--photo) minmax(0,1fr);grid-template-rows:minmax(0,1fr)}
.ad.side.rtl{grid-template-columns:minmax(0,1fr) var(--photo)}
.ad.grid{grid-template-columns:var(--photo) minmax(0,1fr);grid-template-rows:var(--photo) minmax(0,1fr)}
.ad.grid.rtl{grid-template-columns:minmax(0,1fr) var(--photo)}
.ad.grid .photo{grid-column:1;grid-row:1}
.ad.grid .copy.top{grid-column:2;grid-row:1;justify-content:center}
.ad.grid .copy.bottom{grid-column:1 / span 2;grid-row:2;justify-content:center}
.ad.grid.rtl{direction:rtl}.ad.grid.rtl .photo{grid-column:2}.ad.grid.rtl .copy.top{grid-column:1}
.ad.side.rtl{direction:rtl}
.ad.side.rtl .photo{order:2}
.ad.stack{grid-template-rows:var(--photo) minmax(0,1fr);grid-template-columns:minmax(0,1fr)}
.photo{position:relative;overflow:hidden;min-width:0;min-height:0}
.photo img.full{position:absolute;inset:0;width:100%;height:100%}
.photo.white img.full{object-fit:contain;padding:calc(var(--u)*3)}
.photo.scene img.full{object-fit:cover}
.photo.scene.contain img.full{object-fit:contain}
/* Size ladder: every bottle keeps the exact proportions of its photo. Height is set from one shared scale (--lh), width is always auto. */
.ladder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:calc(var(--pu)*4) calc(var(--pu)*3)}
.ladder .row{display:flex;align-items:flex-end;justify-content:center;gap:calc(var(--pu)*.4)}
.ladder figure{display:flex;flex-direction:column;align-items:center;flex:0 0 auto;margin:0}
.ladder img{display:block;height:calc(var(--lh)*var(--k));width:auto;max-width:none;flex:0 0 auto}
.ladder figcaption{margin-top:calc(var(--pu)*1.1);font-weight:500;font-size:calc(var(--pu)*2.5);color:#14110f;letter-spacing:.01em;white-space:nowrap}
.copy{position:relative;display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*2.6);padding:calc(var(--u)*6) calc(var(--u)*6);min-width:0;min-height:0}
.ad.rtl .copy{direction:rtl;text-align:right}
.ad.ltr .copy{direction:ltr;text-align:left}
.brand{height:calc(var(--u)*7.2);width:auto;align-self:flex-start;display:block}
.eyebrow{font-weight:500;font-size:calc(var(--u)*2.9);color:#d9985f;letter-spacing:.02em}
.ad.ltr .eyebrow{letter-spacing:.14em;text-transform:uppercase;font-size:calc(var(--u)*2.3)}
h1{font-weight:800;font-size:calc(var(--u)*var(--hs));line-height:1.22;letter-spacing:-.01em;white-space:nowrap}
h1 b{color:#e0a36a;font-weight:800;white-space:nowrap}
.sub{font-weight:300;font-size:calc(var(--u)*3.15);line-height:1.75;color:#e9dccd;text-wrap:pretty}
.chips{display:flex;flex-wrap:wrap;gap:calc(var(--u)*1.3)}
.chip{border:1px solid #b87333;border-radius:999px;padding:calc(var(--u)*.9) calc(var(--u)*2.2);font-weight:500;font-size:calc(var(--u)*2.35);color:#f2e5d6;white-space:nowrap}
.foot{display:flex;align-items:center;gap:calc(var(--u)*2);margin-top:calc(var(--u)*.6)}
.url{font-weight:800;font-size:calc(var(--u)*3);color:#14110f;background:#d9985f;border-radius:calc(var(--u)*.8);padding:calc(var(--u)*1.1) calc(var(--u)*2.6);direction:ltr;letter-spacing:.01em}
.where{font-weight:300;font-size:calc(var(--u)*2.3);color:#b9a797;white-space:nowrap}
.rule{position:absolute;background:#b87333}
.ad.side .rule{top:0;bottom:0;width:calc(var(--u)*.45)}
.ad.side.rtl .rule{right:0}.ad.side.ltr .rule{left:0}
.ad.stack .rule{left:0;right:0;top:0;height:calc(var(--u)*.45)}
.ad.grid .copy.bottom .rule{left:0;right:0;top:0;height:calc(var(--u)*.45)}
.ad.grid .copy.top .rule{display:none}
.ad.stack .copy{padding-block:calc(var(--u)*4.4);gap:calc(var(--u)*2.1)}
.ad.grid .copy{padding:calc(var(--u)*5) calc(var(--u)*5)}
.ad.grid .copy.bottom .sub{font-size:calc(var(--u)*3.5)}
.ad.grid .copy.bottom .chip{font-size:calc(var(--u)*2.6)}
.ad.grid .copy.bottom .url{font-size:calc(var(--u)*3.4)}
.ad.grid .copy.top .brand{height:calc(var(--u)*8)}
`;

function adHTML(cKey, lang, sKey) {
  const c = CONCEPTS[cKey], t = c[lang], s = SIZES[sKey], f = c.fmt[sKey];
  const u = Math.min(s.w, s.h) / 100;
  const hs = f.layout === 'grid' ? 6.3 : { sq: 8.4, land: 8.6, port: 8.4, story: 9.6 }[sKey];
  const img = f.img || c.img;
  let photo;
  if (c.kind === 'ladder') {
    const figs = c.ladder.map(([src, k, ar, en]) => `<figure><img src="${F(src)}" style="--k:${k}"><figcaption>${lang === 'ar' ? ar : en}</figcaption></figure>`).join('');
    photo = `<div class="photo white" style="background:${c.bg}"><div class="ladder"><div class="row">${figs}</div></div></div>`;
  } else if (c.kind === 'white') {
    photo = `<div class="photo white" style="background:${c.bg}"><img class="full" src="${F(img)}"></div>`;
  } else {
    photo = `<div class="photo scene ${f.fit === 'contain' ? 'contain' : ''}"><img class="full" src="${F(img)}" style="object-position:${f.pos || '50% 50%'}"></div>`;
  }
  const chips = (t.chips || []).map((x) => `<span class="chip">${x}</span>`).join('');
  const brand = `<img class="brand" src="${F('img/wordmark-gold.webp')}" alt="Arabiva Fragrances">`;
  const top = `${brand}<div class="eyebrow">${t.eyebrow}</div><h1>${t.h}</h1>`;
  const bottom = `<div class="sub">${t.sub}</div><div class="chips">${chips}</div><div class="foot"><span class="url">arabiva.com</span></div>`;
  const body = f.layout === 'grid'
    ? `${photo}<div class="copy top"><span class="rule"></span>${top}</div><div class="copy bottom"><span class="rule"></span>${bottom}</div>`
    : `${photo}<div class="copy"><span class="rule"></span>${top}${bottom}</div>`;
  return `<div class="ad ${f.layout} ${lang === 'ar' ? 'rtl' : 'ltr'}" style="width:${s.w}px;height:${s.h}px;--u:${u}px;--pu:${u}px;--photo:${f.track}px;--hs:${hs}">${body}</div>`;
}

const JOBS = [];
for (const c of ['tola', 'spray', 'oil', 'ignis', 'travel']) for (const s of ['sq', 'land', 'port']) JOBS.push([c, 'ar', s]);
for (const c of ['tola', 'spray', 'oil']) for (const s of ['sq', 'land', 'port']) JOBS.push([c, 'en', s]);
for (const c of ['tola', 'spray', 'travel']) JOBS.push([c, 'ar', 'story']);

(async () => {
  const filter = process.argv[2];
  const browser = await chromium.launch();
  const outDir = path.join(ROOT, 'out');
  for (const [c, lang, s] of JOBS) {
    const name = `arabiva-${c}-${lang}-${SIZES[s].w}x${SIZES[s].h}`;
    if (filter && !name.includes(filter)) continue;
    const page = await browser.newPage({ viewport: { width: SIZES[s].w, height: SIZES[s].h }, deviceScaleFactor: 1 });
    const tmp = path.join(ROOT, `_${name}.html`);
    fs.writeFileSync(tmp, `<!doctype html><html lang="${lang}"><meta charset="utf-8"><style>${css}</style><body>${adHTML(c, lang, s)}</body></html>`);
    await page.goto('file://' + tmp);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => {}))));
    // size ladder: one shared scale, as large as fits the panel; then prove no photo was stretched
    const aspect = await page.evaluate(() => {
      const lad = document.querySelector('.ladder');
      if (lad) {
        const row = lad.querySelector('.row'); const cs = getComputedStyle(lad);
        const availW = lad.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), availH = lad.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        let lh = availH; lad.style.setProperty('--lh', lh + 'px');
        for (let n = 0; n < 400 && (row.scrollWidth > availW + 0.5 || row.offsetHeight > availH + 0.5); n++) { lh *= 0.99; lad.style.setProperty('--lh', lh + 'px'); }
      }
      let worst = 0;
      for (const im of document.images) {
        const fit = getComputedStyle(im).objectFit;
        if (fit === 'contain' || fit === 'cover') continue; // these never stretch the picture
        const r = im.getBoundingClientRect(); if (!r.width || !im.naturalWidth) continue;
        worst = Math.max(worst, Math.abs((r.width / r.height) / (im.naturalWidth / im.naturalHeight) - 1));
      }
      return worst;
    });
    if (aspect > 0.01) { console.log(name, 'ASPECT-DISTORTED', aspect.toFixed(3)); process.exitCode = 1; }
    // auto-fit: shrink the type unit until every copy block fits its panel
    const fit = await page.evaluate(() => {
      const ad = document.querySelector('.ad'); let u = parseFloat(ad.style.getPropertyValue('--u')); const u0 = u;
      const over = () => [...document.querySelectorAll('.copy')].some((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); const pt = parseFloat(cs.paddingTop) * 0.8, pl = parseFloat(cs.paddingLeft) * 0.8; return [...el.children].filter(k => !k.classList.contains('rule')).some((k) => { const b = k.getBoundingClientRect(); return k.scrollWidth > k.clientWidth + 1 || b.top < r.top + pt - 1 || b.bottom > r.bottom - pt + 1 || b.left < r.left + pl - 1 || b.right > r.right - pl + 1; }); });
      let n = 0; while (over() && n < 90) { u *= 0.985; ad.style.setProperty('--u', u + 'px'); n++; }
      return { scale: +(u / u0).toFixed(2), stillOver: over() };
    });
    await page.screenshot({ path: path.join(outDir, name + '.png') });
    console.log(name, 'scale', fit.scale, fit.stillOver ? 'OVERFLOW' : 'ok');
    await page.close(); fs.unlinkSync(tmp);
  }
  await browser.close();
})();
