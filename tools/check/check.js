#!/usr/bin/env node
// 사이트 점검 — 빌드된 사이트의 모든 페이지를 실제 브라우저로 열어 본다 (GitHub Actions: .github/workflows/site-check.yml)
//
//   node tools/check/check.js [_site]  [--port 4321] [--setup 모듈.js] [--only /webapps/finance/]
//
// 실패로 치는 것 (exit 1)
//   · 페이지 응답이 200 이 아님 (404.html 제외)
//   · 사이트 안의 깨진 이미지, 사이트 안 요청의 4xx/5xx
//   · 페이지 JS 오류 (allow.js 의 예외 제외), 페이지가 응답하지 않음 (무한 루프 등)
//   · 화면보다 긴 본문이 끝까지 스크롤해도 투명한 채로 남음 (나타나기 효과가 안 풀리는 버그)
//   · 단축 주소 · 옛 주소 (apps.json) 가 제 위치로 가지 않거나, 간 곳이 200 이 아님
//   · 본문 각주(sup.fn)가 sources.json 에 없는 출처 id 를 가리킴, 출처 id 중복 · 제목과 주소가 다 빈 출처
// 경고만 하는 것: 외부(CDN 등) 요청 실패 · 외부 요청이 멈춰 45초 안에 다 못 불러옴 — 남의 서버 사정일 수 있어서
//                 한 페이지가 90초 안에 끝나지 않음 — 점검이 멈추지 않게 다음 페이지로 넘어간다
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
// 출처 목록 (_data/sources/*.yml → sources.json). 본문 각주가 없는 id 를 가리키면 실패
let SOURCES = null;
const ONLY = opt('only', '');
const PAGE_BUDGET = 90000; // 한 페이지에 쓰는 최대 시간 (ms)


function listPages(dir, rel = '') {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel + '/' + e.name;
    if (e.isDirectory()) { if (e.name !== 'assets' && e.name !== 'node_modules') out = out.concat(listPages(path.join(dir, e.name), r)); }
    else if (e.name.endsWith('.html')) out.push(r.replace(/index\.html$/, ''));
  }
  return out.sort();
}

// 페이지 메인 스레드가 3초 안에 답하는지 (evaluate 가 실패해도 답한 것으로 친다 — 페이지가 이동한 경우 등)
const alive = page => Promise.race([page.evaluate(() => 1).then(() => true, () => true), new Promise(z => setTimeout(() => z(false), 3000))]);

async function checkPage(ctx, url, isNotFound) {
  const page = await ctx.newPage();
  const r = { url, status: 0, fail: [], warn: [], slow: '' }; // slow: 시간 초과 사유 (경고)
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
  let timer;
  const budget = new Promise(z => { timer = setTimeout(() => z('timeout'), PAGE_BUDGET); });
  const run = (async () => {
    // 문서 자체가 오면 연 것으로 친다. 외부(CDN) 요청이 멈춰 load 가 늦어지는 건 남의 서버 사정이라 '시간 초과' 경고로만.
    const res = await page.goto(BASE + url, { waitUntil: 'commit', timeout: 45000 });
    r.status = res ? res.status() : 0;
    await page.waitForLoadState('load', { timeout: 45000 }).catch(() => { r.slow = '45초 안에 다 불러오지 못함 (외부 요청이 멈췄을 수 있음)'; });
    if (!isNotFound && r.status !== 200) r.fail.push(`응답 ${r.status}`);
    // load 가 늦은 게 외부 요청 탓이면 페이지는 아직 응답한다. JS 가 메인 스레드를 붙잡고 있으면(무한 루프 등) 실패
    if (r.slow && !(await alive(page))) { r.slow = ''; r.fail.push('페이지가 응답하지 않음 (JS 가 멈춤)'); return; }
    await page.waitForTimeout(800);
    // 끝까지 천천히 스크롤해서 지연 로딩 이미지 · 나타나기 효과까지 모두 일으킨다
    await page.evaluate(async () => {
      const step = Math.max(300, innerHeight * 0.6);
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise(z => setTimeout(z, 90)); }
      scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(1200);
    const found = await page.evaluate(async (hiddenOk) => {
      const out = { broken: [], hidden: [], fn: [] };
      // 출처 각주 id (footnotes.js 가 바꾼 뒤면 data-src, 아니면 href 의 /sources/#id)
      for (const a of document.querySelectorAll('sup.fn > a')) {
        const id = a.getAttribute('data-src') || ((a.getAttribute('href') || '').split('/sources/#')[1] || '');
        out.fn.push(decodeURIComponent(id));
      }
      // 깨진 이미지: 같은 사이트의 <img> 가 디코딩되지 않으면
      //   decode() 는 아직 안 불러온 이미지(숨긴 목록 안의 loading="lazy" 등)면 끝없이 기다리므로 3초만 기다리고,
      //   그래도 안 되면 같은 주소를 새로 불러 본다 (화면을 다시 그리느라 요소가 바뀐 순간일 수도 있어서)
      const settle = (p, ms) => Promise.race([p.then(() => 'ok', () => 'err'), new Promise(z => setTimeout(() => z('wait'), ms))]);
      await Promise.all([...document.querySelectorAll('img')].map(async img => {
        const src = img.currentSrc || img.getAttribute('src') || '';
        if (!src || src.startsWith('data:')) return;
        const abs = new URL(src, location.href);
        if (abs.host !== location.host) return;
        if (await settle(img.decode(), 3000) === 'ok' || (img.complete && img.naturalWidth > 0)) return;
        const fresh = new Image(); fresh.src = abs.href;
        const st = await settle(fresh.decode(), 15000);
        if (st === 'err' || (st === 'ok' && !fresh.naturalWidth)) out.broken.push(abs.pathname);
      }));
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
    if (SOURCES) [...new Set(found.fn)].filter(id => !id || !(id in SOURCES)).forEach(id => r.fail.push('출처 id 없음: ' + (id || '(빈 id)')));
  })();
  try {
    if (await Promise.race([run, budget]) === 'timeout') {
      run.catch(() => {}); // 페이지를 닫으면서 나는 오류는 무시
      if (await alive(page)) r.slow = `${PAGE_BUDGET / 1000}초 안에 끝까지 보지 못함`;
      else { r.slow = ''; r.fail.push('페이지가 응답하지 않음 (JS 가 멈춤)'); }
    }
  } catch (e) {
    r.fail.push('열기 실패: ' + e.message.split('\n')[0]);
  }
  clearTimeout(timer);
  r.fail = [...new Set(r.fail)];
  r.warn = [...new Set(r.warn)];
  await page.close({ runBeforeUnload: false }).catch(() => {});
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
    let external = null, status = 0;
    // 마지막으로 연 문서의 응답 (404.html 의 스크립트가 옮겨 간 페이지)
    page.on('response', res => { if (res.request().isNavigationRequest() && res.frame() === page.mainFrame()) status = res.status(); });
    await page.route(u => !u.href.startsWith(BASE), route => { if (route.request().isNavigationRequest()) { external = route.request().url(); } route.abort(); });
    try { await page.goto(BASE + from, { waitUntil: 'load', timeout: 20000 }); } catch (e) { /* 외부로 나가면 abort */ }
    await page.waitForTimeout(400);
    const got = external || page.url().replace(BASE, '');
    const norm = s => s.replace(/\/(?=[?#]|$)/, '');
    if (norm(got) !== norm(to)) fails.push(`${from} → ${got}  (기대: ${to})`);
    else if (!external && status !== 200) fails.push(`${from} → ${got}  (도착한 페이지 응답 ${status})`);
    await page.close();
  }
  return { count: cases.length, fails };
}

(async () => {
  if (!fs.existsSync(path.join(ROOT, 'index.html'))) { console.error(`빌드된 사이트가 없어요: ${ROOT}`); process.exit(2); }
  const srcFile = path.join(ROOT, 'sources.json');
  const sourceFails = [];
  if (fs.existsSync(srcFile)) {
    const raw = fs.readFileSync(srcFile, 'utf8');
    try { SOURCES = JSON.parse(raw); } catch (e) { sourceFails.push('sources.json 이 올바른 JSON 이 아님: ' + e.message); }
    // 같은 id 가 두 번 나오면 JSON 에서는 뒤의 것만 남는다 → 원문에서 직접 센다
    const ids = [...raw.matchAll(/^\s*,?\s*"([^"]+)": \{ "group"/gm)].map(m => m[1]);
    [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))].forEach(id => sourceFails.push('출처 id 가 두 번 이상: ' + id));
    if (SOURCES) Object.entries(SOURCES).filter(([, v]) => !v.url && !v.title).forEach(([id]) => sourceFails.push('출처에 제목 · 주소가 없음: ' + id));
    if (sourceFails.length) console.log('✗ 출처 목록\n    ' + sourceFails.join('\n    '));
  }
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
    r.warn.forEach(w => { const h = (w.match(/외부 요청 실패: ([^/ ]+)/) || [])[1]; if (h) byHost[h] = (byHost[h] || 0) + 1; });
    r.warnShort = Object.entries(byHost).map(([h, n]) => `${h} ${n}건`);
    console.log(`${r.fail.length ? '✗' : '✓'} ${p}${r.fail.length ? '\n    ' + r.fail.join('\n    ') : ''}${r.slow ? '\n    (시간 초과) ' + r.slow : ''}${r.warnShort.length ? '\n    (외부 요청 실패) ' + r.warnShort.join(', ') : ''}`);
  }

  let redirects = { count: 0, fails: [] };
  if (!ONLY && fs.existsSync(path.join(ROOT, 'apps.json'))) {
    redirects = await checkRedirects(ctx, JSON.parse(fs.readFileSync(path.join(ROOT, 'apps.json'), 'utf8')));
    console.log(`\n단축 · 옛 주소 ${redirects.count}개 중 실패 ${redirects.fails.length}개${redirects.fails.length ? '\n    ' + redirects.fails.join('\n    ') : ''}`);
  }

  await browser.close();
  server.close();

  const bad = results.filter(r => r.fail.length);
  const warned = results.filter(r => r.warnShort.length);
  const slow = results.filter(r => r.slow);
  const summary = [
    `## 사이트 점검 결과`,
    ``,
    `- 페이지 ${results.length}개: 문제 ${bad.length}개, 외부 요청 경고 ${warned.length}개${slow.length ? `, 시간 초과 ${slow.length}개` : ''}`,
    `- 단축 · 옛 주소 ${redirects.count}개: 실패 ${redirects.fails.length}개`,
    ...(SOURCES || sourceFails.length ? [`- 출처 ${SOURCES ? Object.keys(SOURCES).length : 0}개: 문제 ${sourceFails.length}개${sourceFails.length ? ' — ' + sourceFails.join(', ').replace(/\|/g, '\\|') : ''}`] : []),
    ``,
    ...(bad.length ? ['| 페이지 | 문제 |', '|---|---|', ...bad.map(r => `| \`${r.url}\` | ${r.fail.join('<br>').replace(/\|/g, '\\|')} |`), ''] : []),
    ...(redirects.fails.length ? ['**주소 이동 실패**', '', ...redirects.fails.map(f => `- \`${f}\``), ''] : []),
    ...(slow.length ? ['**시간 초과** — 끝까지 보지 못한 페이지 (열기 · JS 오류 · 요청 오류는 그때까지 본 것만)', '', ...slow.map(r => `- \`${r.url}\`: ${r.slow}`), ''] : []),
    ...(warned.length ? ['<details><summary>외부 요청 경고 (CDN · 지도 타일 등)</summary>', '', ...warned.map(r => `- \`${r.url}\`: ${r.warnShort.join(', ')}`), '', '</details>'] : []),
  ].join('\n');
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  console.log('\n' + summary);
  process.exit(bad.length || redirects.fails.length || sourceFails.length ? 1 : 0);
})();
