#!/usr/bin/env node
// 사이트 점검 — 빌드된 사이트의 모든 페이지를 실제 브라우저로 열어 본다 (GitHub Actions: .github/workflows/site-check.yml)
//
//   node tools/check/check.js [_site]  [--port 4321] [--setup 모듈.js] [--only /webapps/finance/]
//
// 실패로 치는 것 (exit 1)
//   · 페이지 응답이 200 이 아님 (404.html 제외)
//   · 사이트 안의 깨진 이미지, 사이트 안 요청의 4xx/5xx
//   · 페이지 JS 오류 (allow.js 의 예외 제외)
//   · 화면보다 긴 본문이 끝까지 스크롤해도 투명한 채로 남음 (나타나기 효과가 안 풀리는 버그)
//   · 단축 주소 · 옛 주소 (apps.json) 가 제 위치로 가지 않음
// 경고만 하는 것: 외부(CDN 등) 요청 실패 — 남의 서버 사정일 수 있어서
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { serve } = require('./serve.js');
const ALLOW = require('./allow.js');

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i === -1 ? d : args[i + 1]; };
const positional = [];
for (let i = 0; i < args.length; i++) { if (args[i].startsWith('--')) { i++; continue; } positional.push(args[i]); }
const ROOT = path.resolve(positional[0] || '_site');
const PORT = +opt('port', 4321);
const BASE = `http://127.0.0.1:${PORT}`;
const SETUP = opt('setup', '') ? require(path.resolve(opt('setup'))) : null;
const ONLY = opt('only', '');

function listPages(dir, rel = '') {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel + '/' + e.name;
    if (e.isDirectory()) { if (e.name !== 'assets' && e.name !== 'node_modules') out = out.concat(listPages(path.join(dir, e.name), r)); }
    else if (e.name.endsWith('.html')) out.push(r.replace(/index\.html$/, ''));
  }
  return out.sort();
}

async function checkPage(ctx, url, isNotFound) {
  const page = await ctx.newPage();
  const r = { url, status: 0, fail: [], warn: [] };
  const host = new URL(BASE).host;
  const allowErr = Object.entries(ALLOW.pageErrors).filter(([p]) => url.startsWith(p)).flatMap(([, v]) => v);
  page.on('pageerror', e => {
    const m = String(e.message || e).split('\n')[0];
    if (!allowErr.some(a => m.includes(a))) r.fail.push('JS 오류: ' + m.slice(0, 160));
  });
  page.on('dialog', d => d.dismiss().catch(() => {}));
  page.on('response', res => {
    const u = new URL(res.url());
    if (u.host === host && res.status() >= 400 && u.pathname !== url) r.fail.push(`요청 ${res.status()}: ${u.pathname}`);
  });
  page.on('requestfailed', req => {
    const u = new URL(req.url());
    const why = (req.failure() || {}).errorText || '';
    if (/ERR_ABORTED/.test(why)) return; // 페이지가 스스로 취소한 요청
    if (u.host === host) r.fail.push(`요청 실패: ${u.pathname} (${why})`);
    else r.warn.push(`외부 요청 실패: ${u.host}${u.pathname.slice(0, 60)} (${why})`);
  });
  try {
    const res = await page.goto(BASE + url, { waitUntil: 'load', timeout: 45000 });
    r.status = res ? res.status() : 0;
    if (!isNotFound && r.status !== 200) r.fail.push(`응답 ${r.status}`);
    await page.waitForTimeout(800);
    // 끝까지 천천히 스크롤해서 지연 로딩 이미지 · 나타나기 효과까지 모두 일으킨다
    await page.evaluate(async () => {
      const step = Math.max(300, innerHeight * 0.6);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(z => setTimeout(z, 90)); }
      scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(1200);
    const found = await page.evaluate(async (hiddenOk) => {
      const out = { broken: [], hidden: [] };
      // 깨진 이미지: 같은 사이트의 <img> 가 디코딩되지 않으면
      for (const img of document.querySelectorAll('img')) {
        const src = img.currentSrc || img.getAttribute('src') || '';
        if (!src || src.startsWith('data:') || new URL(src, location.href).host !== location.host) continue;
        try { await img.decode(); } catch (e) {
          if (img.complete && img.naturalWidth > 0) continue;
          // 화면을 다시 그리느라 요소가 바뀐 순간일 수 있다 → 같은 주소를 새로 불러 봐서 그래도 안 되면 깨진 것
          const fresh = new Image(); fresh.src = new URL(src, location.href).href;
          const ok = await fresh.decode().then(() => fresh.naturalWidth > 0, () => false);
          if (!ok) out.broken.push(new URL(src, location.href).pathname);
        }
      }
      // 끝까지 봤는데도 투명한 긴 본문 (opacity 거의 0, 글자가 많고 화면 높이 이상)
      const vh = innerHeight;
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('dialog,template,[hidden],[aria-hidden="true"]')) continue;
        if (hiddenOk.some(sel => el.matches(sel))) continue;
        const cs = getComputedStyle(el);
        if (parseFloat(cs.opacity) > 0.05 || cs.display === 'none') continue;
        const rect = el.getBoundingClientRect();
        if (rect.height < vh || (el.innerText || '').trim().length < 300) continue;
        if (el.parentElement && parseFloat(getComputedStyle(el.parentElement).opacity) <= 0.05) continue; // 바깥쪽만 센다
        out.hidden.push((el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : '')).slice(0, 80));
      }
      return out;
    }, ALLOW.hiddenOk);
    found.broken.forEach(b => r.fail.push('깨진 이미지: ' + b));
    found.hidden.forEach(h => r.fail.push('본문이 보이지 않음: ' + h));
  } catch (e) {
    r.fail.push('열기 실패: ' + e.message.split('\n')[0]);
  }
  r.fail = [...new Set(r.fail)];
  r.warn = [...new Set(r.warn)];
  await page.close();
  return r;
}

// 단축 주소 · 옛 주소: 404.html 의 스크립트가 보내는 곳이 맞는지
async function checkRedirects(ctx, data) {
  const cases = [];
  for (const a of data.apps) {
    for (const al of a.alias || []) cases.push([`/${al}/`, a.url]);
    if (a.slug && !/^https?:/.test(a.url)) cases.push([`/webapps/${a.slug}/app.html?x=1#y`, `${a.url}?x=1#y`]);
  }
  for (const [from, to] of Object.entries(data.redirects || {})) cases.push([from, to]);
  const fails = [];
  for (const [from, to] of cases) {
    const page = await ctx.newPage();
    let external = null;
    await page.route(u => !u.href.startsWith(BASE), route => { if (route.request().isNavigationRequest()) { external = route.request().url(); } route.abort(); });
    try { await page.goto(BASE + from, { waitUntil: 'load', timeout: 20000 }); } catch (e) { /* 외부로 나가면 abort */ }
    await page.waitForTimeout(400);
    const got = external || page.url().replace(BASE, '');
    const norm = s => s.replace(/\/(?=[?#]|$)/, '');
    if (norm(got) !== norm(to)) fails.push(`${from} → ${got}  (기대: ${to})`);
    await page.close();
  }
  return { count: cases.length, fails };
}

(async () => {
  if (!fs.existsSync(path.join(ROOT, 'index.html'))) { console.error(`빌드된 사이트가 없어요: ${ROOT}`); process.exit(2); }
  const server = await serve(ROOT, PORT);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  if (SETUP) await SETUP(ctx);

  let pages = listPages(ROOT).filter(p => !ALLOW.skipPages.some(s => p.startsWith(s)));
  if (ONLY) pages = pages.filter(p => p.startsWith(ONLY));
  const results = [];
  for (const p of pages) {
    const r = await checkPage(ctx, p, p === '/404.html');
    results.push(r);
    // 외부 요청 경고는 호스트별로 묶어 짧게
    const byHost = {};
    r.warn.forEach(w => { const h = (w.match(/외부 요청 실패: ([^/ ]+)/) || [])[1] || '?'; byHost[h] = (byHost[h] || 0) + 1; });
    r.warnShort = Object.entries(byHost).map(([h, n]) => `${h} ${n}건`);
    console.log(`${r.fail.length ? '✗' : '✓'} ${p}${r.fail.length ? '\n    ' + r.fail.join('\n    ') : ''}${r.warnShort.length ? '\n    (외부 요청 실패) ' + r.warnShort.join(', ') : ''}`);
  }

  let redirects = { count: 0, fails: [] };
  if (!ONLY && fs.existsSync(path.join(ROOT, 'apps.json'))) {
    redirects = await checkRedirects(ctx, JSON.parse(fs.readFileSync(path.join(ROOT, 'apps.json'), 'utf8')));
    console.log(`\n단축 · 옛 주소 ${redirects.count}개 중 실패 ${redirects.fails.length}개${redirects.fails.length ? '\n    ' + redirects.fails.join('\n    ') : ''}`);
  }

  await browser.close();
  server.close();

  const bad = results.filter(r => r.fail.length);
  const warned = results.filter(r => r.warn.length);
  const summary = [
    `## 사이트 점검 결과`,
    ``,
    `- 페이지 ${results.length}개: 문제 ${bad.length}개, 외부 요청 경고 ${warned.length}개`,
    `- 단축 · 옛 주소 ${redirects.count}개: 실패 ${redirects.fails.length}개`,
    ``,
    ...(bad.length ? ['| 페이지 | 문제 |', '|---|---|', ...bad.map(r => `| \`${r.url}\` | ${r.fail.join('<br>').replace(/\|/g, '\\|')} |`), ''] : []),
    ...(redirects.fails.length ? ['**주소 이동 실패**', '', ...redirects.fails.map(f => `- \`${f}\``), ''] : []),
    ...(warned.length ? ['<details><summary>외부 요청 경고 (CDN · 지도 타일 등)</summary>', '', ...warned.map(r => `- \`${r.url}\`: ${r.warnShort.join(', ')}`), '', '</details>'] : []),
  ].join('\n');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  console.log('\n' + summary);
  process.exit(bad.length || redirects.fails.length ? 1 : 0);
})();
