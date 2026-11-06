// 썸네일을 찍기 전에 앱을 보기 좋은 상태로 만드는 앱별 절차 (tools/thumbs.js 가 읽는다)
//   형식: slug: async (page, { root, base }) => { ... }   root = 저장소 경로 (예시 파일을 올릴 때)
//   첫 화면이 비어 있는 앱만 적는다. 나머지는 열자마자 찍는다.
const path = require('path');

module.exports = {
  // flood_map
  "flood_map": async (page) => {
    // GeoJSON 11개(2022년은 20MB)를 다 읽을 때까지 로딩 화면이 덮고 있다
    await page.waitForSelector('#loading.hidden', { state: 'attached', timeout: 30000 }).catch(() => {});
    await page.waitForSelector('#layer-list .layer-item', { timeout: 5000 }).catch(() => {});
    const btn = page.locator('.controls-bar .ctrl-btn', { hasText: '전체 켜기' });
    if (await btn.count()) { await btn.first().click(); await page.mouse.move(1270, 790); }
    else await page.evaluate(() => { if (typeof toggleAll === 'function') toggleAll(true); });
    // 침수가 몰린 서울 남부(관악·동작·강남)를 한 단계 확대, 왼쪽 패널(340px)을 피해 오른쪽 지도 영역 가운데에 둔다
    await page.evaluate(() => {
      if (document.activeElement) document.activeElement.blur();
      try {
        map.setView([37.495, 126.965], 13, { animate: false });
        map.panBy([-170, 0], { animate: false });
      } catch (e) {}
    });
    // 캔버스에 폴리곤이 다 그려지고 배경 타일이 들어올 시간
    await page.waitForTimeout(2500);
  },

  // demo_physicsSimulation
  "demo_physicsSimulation": async (page) => {
    const sec = page.locator('#spring-simulation');
    await sec.waitFor({ timeout: 10000 }).catch(() => {});
    const start = sec.getByRole('button', { name: 'Start', exact: true });
    if (!(await start.count())) return;
    // 한 프레임에 dt 만큼 진행해서 느린 기기(SwiftShader)에선 오래 걸린다 → dt 를 2배(0.032)로 (화면 밖 입력칸)
    const dtInput = sec.locator('tr', { hasText: 'dt' }).locator('input');
    if (await dtInput.count()) await dtInput.first().fill('0.032');
    await start.click();
    // 반주기(π ≈ 3.14s)를 넘기면 멈춘다 — 위상 다이어그램에 반원, 최대 8초
    const t0 = Date.now();
    while (Date.now() - t0 < 8000) {
      const t = await page.evaluate(() => {
        const el = document.querySelector('#spring-simulation .status');
        const m = el && el.innerText.match(/Time:\s*([\d.]+)/);
        return m ? parseFloat(m[1]) : 0;
      });
      if (t >= 3.3) break;
      await page.waitForTimeout(150);
    }
    const stop = sec.getByRole('button', { name: 'Stop', exact: true });
    if (await stop.count()) await stop.click();
    await page.waitForTimeout(400); // 차트는 200ms 마다 갱신
    // Start·Stop 버튼 줄을 맨 위에: 현재 값, 질량 애니메이션, 위상 다이어그램이 한 화면에
    await page.evaluate(() => {
      if (document.activeElement) document.activeElement.blur();
      const c = document.querySelector('#spring-simulation .controls');
      if (c) window.scrollTo(0, c.getBoundingClientRect().top + window.scrollY - 10);
    });
    await page.mouse.move(1270, 790);
  },

  // art_primitive_brush
  "art_primitive_brush": async (page, { root, base }) => {
    // 기본 샘플(모나리자)이 원본 패널에 그려질 때까지
    await page.waitForFunction(() => {
      const c = document.getElementById('src');
      return c && c.width > 0;
    }, null, { timeout: 8000 }).catch(() => {});
    const started = await page.evaluate(() => {
      const $ = (id) => document.getElementById(id);
      // 탐색 강도만 낮춰 10초 안팎에 끝나게 (화면 위쪽 설정 · 도형 150개는 기본값 그대로)
      const set = (id, v) => { const r = $(id); if (!r) return; r.value = v; if (r.nextElementSibling) r.nextElementSibling.value = v; };
      set('candidates', 500);
      set('restarts', 8);
      // 브러시 적용 → 원본 · 미적용 · 브러시 세 패널이 나란히 보인다
      const brush = document.querySelector('input[name="output"][value="brush"]');
      if (brush) { brush.checked = true; brush.dispatchEvent(new Event('change', { bubbles: true })); }
      // 수채(fill)는 소프트웨어 WebGL 에서 수 분이 걸리므로 빠른 해칭으로
      const fill = $('fillStyle');
      if (fill) fill.value = 'hatch';
      const run = $('run');
      if (!run || run.disabled) return false;
      run.click(); // element.click() — 버튼 쪽으로 스크롤하지 않음
      return true;
    });
    if (!started) return;
    // 생성 → 브러시 렌더까지 끝나면 상태에 '완료' 가 붙고 #run 이 다시 켜진다
    await page.waitForFunction(() => {
      const r = document.getElementById('run');
      const s = document.getElementById('status');
      return r && !r.disabled && s && /완료/.test(s.textContent);
    }, null, { timeout: 30000, polling: 200 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  },

  // demo_qrcode
  "demo_qrcode": async (page, { root, base }) => {
    const input = await page.$('#url');
    if (!input) return;
    await input.fill('https://wbpark.app');
    const btn = await page.$('#qrForm button[type="submit"]');
    if (btn) await btn.click();
    // QRCode.toDataURL 결과가 img 에 들어갈 때까지 기다린다
    await page.waitForFunction(() => {
      const img = document.getElementById('qrImage');
      return img && !img.hidden && img.complete && img.naturalWidth > 0;
    }, null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(200);
  },

  // warhammer_map
  "warhammer_map": async (page, { root, base }) => {
    const click = async (sel) => { const el = await page.$(sel); if (el) { await el.click().catch(() => {}); await page.waitForTimeout(250); return true; } return false; };
    // 1) 전장 고르기: 내 성향 · 상대 성향을 고르면 추천 지도 3개가 나온다
    await click('#setup [data-fdset="myFd"][data-fdval="Take and Hold"]');
    await click('#setup [data-fdset="oppFd"][data-fdval="Purge the Foe"]');
    await page.waitForTimeout(200);
    if (!(await click('#setup .mapcard'))) return;
    await page.waitForTimeout(500);
    // 2) 아군 · 적 유닛을 하나씩 놓아 판이 비어 보이지 않게
    if (await click('#panel [data-draftside="me"]')) await click('#panel [data-act="addUnit"]');
    if (await click('#panel [data-draftside="enemy"]')) await click('#panel [data-act="addUnit"]');
    await page.waitForTimeout(400);
  },

  // warhammer_move
  "warhammer_move": async (page, { root, base }) => {
    // 1) 「이동 페이즈」 안내 상자를 닫는다
    const g = await page.$('#gate.on #gNext');
    if (g) { await g.click().catch(() => {}); await page.waitForTimeout(400); }
    // 2) A 진영 첫 유닛(보병 분대)을 골라 이동 범위 고리 · 시야 부채꼴을 띄운다 (판은 닫힌 채라 목록을 코드로 누른다)
    await page.evaluate(() => { const c = document.querySelector('#unitList [data-un]'); if (c) c.click(); });
    await page.waitForTimeout(400);
    // 3) 휠 한 칸만 당겨 판을 화면에 꽉 차게 (wheel → cam.dist × 0.9)
    if (await page.$('canvas')) { await page.mouse.move(640, 430); await page.mouse.wheel(0, -100); }
    await page.waitForTimeout(400);
  },

  // warhammer_simul
  "warhammer_simul": async (page, { root, base }) => {
    // 1) 한국어 브라우저로 다시 연다 — 기본 프로필 이름(「프로필 1」)까지 한국어로 나오게
    if (await page.evaluate(() => document.documentElement.lang !== 'ko')) {
      await page.addInitScript(() => { Object.defineProperty(Navigator.prototype, 'language', { get: () => 'ko-KR' }); });
      await page.evaluate(() => { try { localStorage.removeItem('bulk_html_v2'); } catch (e) {} });
      await page.reload({ waitUntil: 'load' }).catch(() => {});
      await page.waitForTimeout(600);
    }
    // 2) ⓪ 확인 목록을 「전부 확인」 — 결과 위에 '아직 확인하지 않은 항목' 안내가 끼지 않게
    const all = await page.$('#pre [data-checkall]');
    if (all) { await all.click().catch(() => {}); await page.waitForTimeout(200); }
    // 3) 시드를 고정해 늘 같은 결과가 나오게 하고 「계산 시작」
    const seed = await page.$('#seed');
    if (seed) { await seed.fill('7'); await seed.dispatchEvent('change'); }
    const run = await page.$('#run');
    if (!run) return;
    await run.click().catch(() => {});
    await page.waitForFunction(() => document.querySelector('#out .chart'), null, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(400);
    // 4) 결과 카드(단계별 예상값 · 실제 결과 표 + 분포 그래프)가 한 화면에 들도록
    await page.evaluate(() => { const c = document.querySelector('#out .card') || document.querySelector('#out'); if (c) c.scrollIntoView({ block: 'start' }); });
    await page.waitForTimeout(300);
  },

  // game_snake
  "game_snake": async (page, { root, base }) => {
    // 「Start」를 누른 뒤, 고정 시드 + 자동 조종으로 몇 초어치(틱)를 직접 돌려 먹이를 먹고 길어진 뱀을 보여 준다.
    // 타이머 대신 gameLoop() 를 직접 불러서 늘 같은 화면이 나온다 (마지막 틱 뒤 멈춘 채로 찍힘).
    const ok = await page.evaluate(async () => {
      if (typeof gameLoop !== 'function' || !document.getElementById('startBtn')) return false;
      let a = 20261106 >>> 0; // mulberry32 — 먹이 자리가 늘 같게
      Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      document.getElementById('startBtn').click();
      clearInterval(gameInterval);
      const safe = (x, y) => x >= 0 && y >= 0 && x < cols && y < rows && !snake.slice(0, -1).some(s => s.x === x && s.y === y);
      const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
      for (let step = 0; step < 400 && snake.length < 20; step++) {
        const h = snake[0];
        const opts = dirs.filter(([x, y]) => !(x === -lastDx && y === -lastDy) && safe(h.x + x, h.y + y))
          .sort((p, q) => (Math.abs(h.x + p[0] - food.x) + Math.abs(h.y + p[1] - food.y)) - (Math.abs(h.x + q[0] - food.x) + Math.abs(h.y + q[1] - food.y)));
        if (!opts.length) break;
        turn(opts[0][0], opts[0][1]);
        gameLoop();
        if (!isGameRunning) break;
        await new Promise(r => setTimeout(r, 5));
      }
      return true;
    }).catch(() => false);
    if (!ok) { const b = await page.$('#startBtn'); if (b) await b.click().catch(() => {}); await page.waitForTimeout(3000); }
  },

};
