#!/usr/bin/env node
// 웹앱 카드 썸네일 만들기 — 실제 앱 화면을 찍어 assets/thumbs/<slug>.webp (640x400) 로 저장
//
//   1) 사이트를 띄운다:        bundle exec jekyll serve        (http://localhost:4000)
//   2) 썸네일을 만든다:        node tools/thumbs.js
//      몇 개만:               node tools/thumbs.js --only finance,qrcode   (slug 또는 단축 주소)
//      다른 주소:             node tools/thumbs.js --base http://127.0.0.1:4000
//      공유 미리보기 이미지:   node tools/thumbs.js --og       (assets/images/og-default.jpg 만. --only 를 같이 주면 그 앱들도)
//      저장 위치 바꾸기:       node tools/thumbs.js --out /tmp/thumbs
//
// 필요: Node 20+, Playwright — 사이트 점검 도구와 같이 쓴다: cd tools/check && npm ci && npx playwright install chromium
// 앱을 보기 좋게 만들려고 누르거나 파일을 올려야 하면 tools/thumbs.hooks.js 에 적는다.
// 내용이 화면 구석에 작게 있는 앱은 훅에서 page.setViewportSize({ width: 640, height: 400 }) 로 크게 찍는다.
// --setup <파일.js> : 브라우저 컨텍스트를 받는 함수를 내보내는 모듈 (예: 오프라인 CDN 미러 연결)

const fs = require('fs');
const path = require('path');
// tools/check 에 설치한 Playwright 를 쓴다 (없으면 이 폴더 · 전역 설치)
const { chromium } = require(require.resolve('playwright', { paths: [path.join(__dirname, 'check'), __dirname] }));

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i === -1 ? def : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const BASE = String(opt('base', 'http://localhost:4000')).replace(/\/$/, '');
const ONLY = opt('only', '') ? String(opt('only')).split(',').map(s => s.trim().toLowerCase()) : null;
const OUT = opt('out', '') ? path.resolve(String(opt('out'))) : path.join(ROOT, 'assets', 'thumbs');
const SETUP = opt('setup', '') ? require(path.resolve(String(opt('setup')))) : null;
// --hooks <파일.js> : 앱별 조작 절차 파일 (기본: tools/thumbs.hooks.js)
const HOOKS_FILE = opt('hooks', '') ? path.resolve(String(opt('hooks'))) : path.join(__dirname, 'thumbs.hooks.js');
let HOOKS = {};
try { HOOKS = require(HOOKS_FILE); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }

const W = 1280, H = 800, TW = 640, TH = 400;

// PNG 스크린샷 → 축소 + WebP 인코딩 (브라우저 캔버스로 처리해서 별도 이미지 라이브러리가 필요 없다)
async function toWebp(page, png, w, h, type = 'image/webp', quality = 0.82) {
  return page.evaluate(async ({ b64, w, h, type, quality }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    // 비율이 다르면 가운데를 잘라 채운다
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s, dh = img.height * s;
    g.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return c.toDataURL(type, quality).split(',')[1];
  }, { b64: png.toString('base64'), w, h, type, quality });
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, colorScheme: 'light' });
  if (SETUP) await SETUP(ctx);
  const enc = await ctx.newPage(); // 인코딩 전용 빈 페이지
  await enc.setContent('<!doctype html><title>enc</title>');

  if (opt('og', false)) {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: 1200, height: 630 });
    await p.goto(BASE + '/', { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(800);
    const png = await p.screenshot();
    const jpg = await toWebp(enc, png, 1200, 630, 'image/jpeg', 0.86);
    fs.writeFileSync(path.join(ROOT, 'assets', 'images', 'og-default.jpg'), Buffer.from(jpg, 'base64'));
    console.log('og  assets/images/og-default.jpg');
    await p.close();
    if (!ONLY) { await browser.close(); return; } // --og 만 주면 공유 이미지만 만든다
  }

  const data = await (await fetch(BASE + '/apps.json')).json();
  // 썸네일을 직접 정한 앱(thumbnail: false 로 아이콘을 쓰는 앱 포함)은 건너뛴다
  const apps = data.apps.filter(a => a.slug && !a.hidden && !/^https?:/.test(a.url) && a.thumbnail == null)
    .filter(a => !ONLY || ONLY.includes(a.slug.toLowerCase()) || (a.alias || []).some(x => ONLY.includes(String(x).toLowerCase())));
  fs.mkdirSync(OUT, { recursive: true });

  let ok = 0;
  for (const app of apps) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => d.dismiss().catch(() => {}));
    try {
      await page.goto(BASE + app.url, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(1200);
      if (HOOKS[app.slug]) await HOOKS[app.slug](page, { root: ROOT, base: BASE });
      await page.waitForTimeout(800);
      const vp = page.viewportSize(); // 훅이 화면 크기를 바꿨을 수 있다
      await page.mouse.move(vp.width - 2, vp.height - 2); // 마우스 hover 효과가 찍히지 않게
      await page.addStyleTag({ content: '.wbpark-appbar{display:none!important}' }); // 블로그로 돌아가기 표시는 빼고
      const png = await page.screenshot();
      const webp = await toWebp(enc, png, TW, TH);
      fs.writeFileSync(path.join(OUT, app.slug + '.webp'), Buffer.from(webp, 'base64'));
      ok++;
      console.log(`ok  ${app.slug}${errors.length ? '   (페이지 오류: ' + errors[0].slice(0, 80) + ')' : ''}`);
    } catch (e) {
      console.log(`!!  ${app.slug}: ${e.message.split('\n')[0]}`);
    }
    await page.close();
  }
  console.log(`\n${ok}/${apps.length} 개 저장 → assets/thumbs/`);
  await browser.close();
})();
