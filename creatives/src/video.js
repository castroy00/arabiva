// Arabiva 15 s video ad — built from the store's own photos (unaltered: only uniform zoom and fades) + text layers.
// Usage: node video.js v|h
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const ROOT = __dirname;
const F = (p) => 'file://' + path.join(ROOT, p);
const mode = process.argv[2] || 'v';
const W = mode === 'v' ? 1080 : 1920, H = mode === 'v' ? 1920 : 1080, FPS = 30;

const ladder = [['img/c-50g.webp', 0.50, '50 غ'], ['img/c-100g.webp', 0.60, '100 غ'], ['img/c-250g.webp', 0.72, '250 غ'], ['img/c-500g.webp', 0.86, '500 غ'], ['img/c-1kg.webp', 1.0, '1 كغ']];
const SCENES = [
  { type: 'logo', dur: 1.5, line: 'عطور وزيوت عطرية من الكويت' },
  { type: 'shot', dur: 2.9, kind: 'white', bg: '#fefcfb', img: 'img/tola.webp', eyebrow: 'تولة أرابيفا', h: 'جرّب عطرك<br>من <b>1 د.ك</b>', sub: 'أكثر من 2,000 عطر مستوحى، مسك وعود' },
  { type: 'shot', dur: 2.9, kind: 'scene', img: 'img/arch.webp', eyebrow: 'بخاخ العطر', h: 'بخاخ 50 مل<br>من <b>6 د.ك</b>', sub: 'والحجم الكبير 200 مل من 12 د.ك' },
  { type: 'shot', dur: 2.9, kind: 'scene', img: mode === 'v' ? 'img/travel-mobile.webp' : 'img/travel-mobile.webp', pos: '50% 60%', eyebrow: 'بخاخ السفر', h: 'عطرك معك<br>10 مل من <b>2.5 د.ك</b>', sub: 'لفّة واحدة ويظهر البخاخ' },
  { type: 'shot', dur: 2.9, kind: 'ladder', bg: '#fefefe', eyebrow: 'زيوت عطرية مركّزة', h: '50 غرام<br>من <b>2 د.ك</b>', sub: 'أحجام من 50 غرام إلى 1 كيلو' },
  { type: 'end', dur: 1.9, h: 'اطلب الآن', line: 'توصيل للكويت والخليج' },
];
const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0);

const fontFace = (w) => `@font-face{font-family:Alexandria;font-weight:${w};src:url(${F(`fonts/alexandria-arabic-${w}-normal.woff2`)}) format('woff2');unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFC,U+200C-200E}
@font-face{font-family:Alexandria;font-weight:${w};src:url(${F(`fonts/alexandria-latin-${w}-normal.woff2`)}) format('woff2')}`;
const u = Math.min(W, H) / 100;
const photoBox = mode === 'v' ? `left:0;top:0;width:${W}px;height:${Math.round(H * 0.58)}px` : `left:0;top:0;width:${H}px;height:${H}px`;
const copyBox = mode === 'v' ? `left:0;right:0;top:${Math.round(H * 0.58)}px;bottom:0` : `left:${H}px;right:0;top:0;bottom:0`;
const css = `${[300, 500, 800].map(fontFace).join('\n')}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;background:#14110f;overflow:hidden;font-family:Alexandria,sans-serif;color:#faf4ec}
.scene{position:absolute;inset:0;opacity:0;background:#14110f}
.photo{position:absolute;${photoBox};overflow:hidden}
.photo img.full{position:absolute;inset:0;width:100%;height:100%;transform-origin:50% 55%}
.photo.white img.full{object-fit:contain;padding:${u * 7}px}
.photo.pic img.full{object-fit:cover}
.ladder{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:${u * 6}px ${u * 4}px}
.ladder .row{display:flex;align-items:flex-end;justify-content:center;gap:${u * 0.5}px;direction:rtl;transform-origin:50% 60%}
.ladder figure{display:flex;flex-direction:column;align-items:center;flex:0 0 auto;margin:0}
.ladder img{display:block;height:calc(var(--lh)*var(--k));width:auto;max-width:none;flex:0 0 auto}
.ladder figcaption{margin-top:${u * 1.4}px;font-weight:500;font-size:${u * 3}px;color:#14110f;direction:rtl;white-space:nowrap}
.copy{position:absolute;${copyBox};display:flex;flex-direction:column;justify-content:center;gap:${u * 3}px;padding:${u * 7}px ${u * 8}px;direction:rtl;text-align:right;border-${mode === 'v' ? 'top' : 'left'}:${u * 0.5}px solid #b87333}
.brand{height:${u * 8.6}px;align-self:flex-start}
.eyebrow{font-weight:500;font-size:${u * 3.6}px;color:#d9985f}
h1{font-weight:800;font-size:${u * (mode === 'v' ? 10.4 : 7.2)}px;line-height:1.22;white-space:nowrap}
h1 b{color:#e0a36a}
.sub{font-weight:300;font-size:${u * 3.9}px;color:#e9dccd;line-height:1.6}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${u * 4.5}px;text-align:center;direction:rtl}
.center .big{width:${mode === 'v' ? 72 : 46}%;height:auto}
.center .line{font-weight:300;font-size:${u * 4.4}px;color:#e9dccd}
.center h1{font-size:${u * 10}px}
.url{font-weight:800;font-size:${u * 5.2}px;color:#14110f;background:#d9985f;border-radius:${u}px;padding:${u * 1.6}px ${u * 4.4}px;direction:ltr}
.rule{width:${u * 16}px;height:${u * 0.5}px;background:#b87333}
[data-in]{will-change:opacity,transform}`;

function sceneHTML(s, i) {
  if (s.type === 'logo') return `<div class="scene" id="s${i}"><div class="center"><img class="big" data-in="0" src="${F('img/wordmark-gold.webp')}"><div class="rule" data-in="1"></div><div class="line" data-in="2">${s.line}</div></div></div>`;
  if (s.type === 'end') return `<div class="scene" id="s${i}"><div class="center"><img class="big" data-in="0" src="${F('img/wordmark-gold.webp')}"><h1 data-in="1">${s.h}</h1><div class="url" data-in="2">arabiva.com</div><div class="line" data-in="3">${s.line}</div></div></div>`;
  let photo;
  if (s.kind === 'ladder') photo = `<div class="photo white" style="background:${s.bg}"><div class="ladder"><div class="row zoom">${ladder.map(([src, k, cap]) => `<figure><img src="${F(src)}" style="--k:${k}"><figcaption>${cap}</figcaption></figure>`).join('')}</div></div></div>`;
  else if (s.kind === 'white') photo = `<div class="photo white" style="background:${s.bg}"><img class="full zoom" src="${F(s.img)}"></div>`;
  else photo = `<div class="photo pic"><img class="full zoom" src="${F(s.img)}" style="object-position:${s.pos || '50% 50%'}"></div>`;
  return `<div class="scene" id="s${i}">${photo}<div class="copy"><img class="brand" src="${F('img/wordmark-gold.webp')}"><div class="eyebrow" data-in="0">${s.eyebrow}</div><h1 data-in="1">${s.h}</h1><div class="sub" data-in="2">${s.sub}</div></div></div>`;
}

(async () => {
  const frames = path.join(ROOT, `_frames_${mode}`);
  fs.rmSync(frames, { recursive: true, force: true }); fs.mkdirSync(frames);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const tmp = path.join(ROOT, `_video_${mode}.html`);
  fs.writeFileSync(tmp, `<!doctype html><html lang="ar"><meta charset="utf-8"><style>${css}</style><body>${SCENES.map(sceneHTML).join('')}</body></html>`);
  await page.goto('file://' + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => {}))));
  // size ladder: one shared scale; then prove no photo is stretched in any scene
  const aspect = await page.evaluate(() => {
    document.querySelectorAll('.scene').forEach((el) => { el.style.opacity = 1; });
    document.querySelectorAll('.ladder').forEach((lad) => {
      const row = lad.querySelector('.row'); const cs = getComputedStyle(lad);
      const availW = lad.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), availH = lad.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      let lh = availH * 0.94; lad.style.setProperty('--lh', lh + 'px'); // leaves room for the 5% zoom
      for (let n = 0; n < 400 && (row.scrollWidth > availW * 0.95 || row.offsetHeight > availH * 0.95); n++) { lh *= 0.99; lad.style.setProperty('--lh', lh + 'px'); }
    });
    let worst = 0;
    for (const im of document.images) {
      const fit = getComputedStyle(im).objectFit; if (fit === 'contain' || fit === 'cover') continue;
      const r = im.getBoundingClientRect(); if (!r.width || !im.naturalWidth) continue;
      worst = Math.max(worst, Math.abs((r.width / r.height) / (im.naturalWidth / im.naturalHeight) - 1));
    }
    return worst;
  });
  if (aspect > 0.01) { console.log('ASPECT-DISTORTED', aspect.toFixed(3)); process.exit(1); }
  const starts = []; let acc = 0; for (const s of SCENES) { starts.push(acc); acc += s.dur; }
  const N = Math.round(TOTAL * FPS);
  for (let f = 0; f < N; f++) {
    const t = f / FPS;
    const bad = await page.evaluate(({ t, starts, durs }) => {
      const ease = (x) => { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); };
      // Every scene is opaque. A scene's text leaves before the next scene starts to cover it,
      // so a photo is never on screen with another scene's words.
      const XF = 0.35, OUT = 0.25; let bad = null;
      const ops = starts.map((st, i) => { const lt = t - st, d = durs[i]; if (lt >= d || lt < -XF) return 0; return i === 0 ? 1 : ease((lt + XF) / XF); });
      starts.forEach((st, i) => {
        const el = document.getElementById('s' + i); const lt = t - st, d = durs[i]; const op = ops[i];
        el.style.opacity = op; el.style.zIndex = i;
        if (op === 0) return;
        const last = i === starts.length - 1;
        const leave = last ? 1 : 1 - ease((lt - (d - XF - OUT)) / OUT);
        const z = el.querySelector('.zoom'); if (z) z.style.transform = `scale(${1 + 0.05 * Math.max(0, Math.min(1, (lt + XF) / (d + XF)))})`;
        let text = 0;
        el.querySelectorAll('[data-in]').forEach((k) => { const n = +k.dataset.in; const p = ease((lt - 0.04 - n * 0.1) / 0.38); const o = p * leave; text = Math.max(text, o); k.style.opacity = o; k.style.transform = `translateY(${(1 - p) * 26}px)`; });
        if (!last && ops[i + 1] > 0 && text > 0.001) bad = `scene ${i} text ${text.toFixed(3)} under scene ${i + 1} at ${ops[i + 1].toFixed(3)}`;
      });
      return bad;
    }, { t, starts, durs: SCENES.map((s) => s.dur) });
    if (bad) { console.log('OUT-OF-SYNC', 'frame', f, bad); process.exit(1); }
    await page.screenshot({ path: path.join(frames, String(f).padStart(4, '0') + '.jpg'), type: 'jpeg', quality: 95 });
  }
  await browser.close(); fs.unlinkSync(tmp);
  const out = path.join(ROOT, 'out', `arabiva-video-15s-${W}x${H}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, '%04d.jpg'), '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', out]);
  fs.rmSync(frames, { recursive: true, force: true });
  console.log('wrote', out, N, 'frames');
})();
