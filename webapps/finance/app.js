// ===== Finance Lab - app.js =====
// 데이터 로드 후 모든 섹션 렌더링

let KR, US, FX, ETF, TOP10;

async function loadData() {
  const [kr, us, fx, etf, top10] = await Promise.all([
    fetch('data/monetary_kr.json').then(r => r.json()),
    fetch('data/monetary_us.json').then(r => r.json()),
    fetch('data/exchange_rate.json').then(r => r.json()),
    fetch('data/etf_backtest.json').then(r => r.json()),
    fetch('data/top10_strategy.json').then(r => r.json())
  ]);
  KR = kr; US = us; FX = fx; ETF = etf; TOP10 = top10;
  renderAll();
}

function renderAll() {
  renderSourceLinks();
  renderCompareTable();
  renderM2Chart();
  renderExchangeChart();
  renderM2FxCorrelation();
  renderDepreciation();
  setupDepCalc();
  renderETFSim();
  renderETFBacktest();
  setupBtCalc();
  renderTop10();
  setupObserver();
}

// ===== SOURCE LINKS =====
function makeSourceHTML(sources) {
  return sources.map(s =>
    `<a class="source-link" href="${s.url}" target="_blank" rel="noopener">📎 ${s.name}</a>`
  ).join(' ');
}

function renderSourceLinks() {
  document.getElementById('data-sources-box').innerHTML =
    '<div style="margin-bottom:8px"><span style="font-size:.8rem;color:var(--text2)">데이터 출처:</span></div>' +
    makeSourceHTML([...KR.sources, ...US.sources, ...FX.sources]);
  document.getElementById('etf-sources-box').innerHTML =
    makeSourceHTML(ETF.sources);
  document.getElementById('top10-sources-box').innerHTML =
    makeSourceHTML(TOP10.sources);
}

// ===== COMPARE TABLE =====
function renderCompareTable() {
  const thead = document.querySelector('#compare-table thead');
  const tbody = document.querySelector('#compare-table tbody');
  thead.innerHTML = `<tr>
    <th rowspan="2">연도</th>
    <th colspan="4" style="text-align:center;color:var(--cyan)">🇰🇷 한국 (조원)</th>
    <th colspan="3" style="text-align:center;color:var(--gold)">🇺🇸 미국 ($T)</th>
    <th colspan="2" style="text-align:center;color:var(--purple)">💱 환율</th>
  </tr><tr>
    <th>M0</th><th>M1</th><th>M2</th><th>M2증가율</th>
    <th>M0</th><th>M1</th><th>M2</th>
    <th>KRW/USD</th><th>변동률</th>
  </tr>`;
  tbody.innerHTML = KR.data.map((kr, i) => {
    const us = US.data[i];
    const fx = FX.data[i];
    const m2g = kr.m2_growth;
    const fxc = fx.change_pct;
    return `<tr>
      <td style="font-weight:600">${kr.year}</td>
      <td>${kr.m0.toFixed(1)}</td><td>${kr.m1.toLocaleString()}</td>
      <td>${kr.m2.toLocaleString()}</td>
      <td class="${m2g > 8 ? 'neg' : 'pos'}">${m2g.toFixed(1)}%</td>
      <td>${us.m0.toFixed(2)}</td><td>${us.m1.toFixed(2)}</td><td>${us.m2.toFixed(2)}</td>
      <td>${fx.rate.toLocaleString()}</td>
      <td class="${fxc > 0 ? 'neg' : fxc < 0 ? 'pos' : ''}">${fxc != null ? (fxc > 0 ? '+' : '') + fxc.toFixed(1) + '%' : '-'}</td>
    </tr>`;
  }).join('');
}

// ===== M2 COMPARE CHART =====
function renderM2Chart() {
  const years = KR.data.map(d => d.year);
  new Chart(document.getElementById('chart-m2-compare'), {
    type: 'line',
    data: {
      labels: years,
      datasets: [
        {
          label: '🇰🇷 한국 M2 (조원)',
          data: KR.data.map(d => d.m2),
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(6,182,212,0.1)',
          fill: true, tension: 0.3, yAxisID: 'y'
        },
        {
          label: '🇺🇸 미국 M2 ($T)',
          data: US.data.map(d => d.m2),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.1)',
          fill: true, tension: 0.3, yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { type: 'linear', position: 'left', title: { display: true, text: '한국 M2 (조원)', color: '#06b6d4' },
          ticks: { color: '#06b6d4' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y1: { type: 'linear', position: 'right', title: { display: true, text: '미국 M2 ($T)', color: '#f59e0b' },
          ticks: { color: '#f59e0b' }, grid: { drawOnChartArea: false } }
      }
    }
  });
}

// ===== EXCHANGE RATE CHART =====
function renderExchangeChart() {
  new Chart(document.getElementById('chart-exchange'), {
    type: 'line',
    data: {
      labels: FX.data.map(d => d.year),
      datasets: [{
        label: '원/달러 환율 (연평균)',
        data: FX.data.map(d => d.rate),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.1)',
        fill: true, tension: 0.3, pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// ===== M2 DIFFERENTIAL vs FX =====
function renderM2FxCorrelation() {
  const years = KR.data.map(d => d.year);
  const usM2g = US.data.map((d, i) => i === 0 ? 0 : ((d.m2 - US.data[i-1].m2) / US.data[i-1].m2 * 100));
  const krM2g = KR.data.map(d => d.m2_growth);
  const diff = krM2g.map((k, i) => k - usM2g[i]); // 한국이 미국보다 더 많이 찍으면 양수
  new Chart(document.getElementById('chart-m2-fx-correlation'), {
    type: 'bar',
    data: {
      labels: years,
      datasets: [
        {
          label: 'M2 증가율 차이 (한국 − 미국, %p)',
          data: diff,
          backgroundColor: diff.map(d => d >= 0 ? 'rgba(239,68,68,0.6)' : 'rgba(16,185,129,0.6)'),
          borderRadius: 3
        },
        {
          label: '💱 환율 변동률 (%)',
          data: FX.data.map(d => d.change_pct || 0),
          type: 'line',
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,0.1)',
          fill: false, tension: 0.3, pointRadius: 4, borderWidth: 2,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' },
          title: { display: true, text: '%p / %', color: '#94a3b8' } }
      }
    }
  });
}

// ===== DEPRECIATION =====
let depRows = [];
function renderDepreciation() {
  const thead = document.querySelector('#depreciation-table thead');
  const tbody = document.querySelector('#depreciation-table tbody');
  thead.innerHTML = `<tr><th>연도</th><th>CPI(%)</th><th>M2증가율(%)</th>
    <th>하락률(%)</th><th>잔존가치</th><th style="color:var(--gold)">🧮 환산 금액</th></tr>`;

  let cumValue = 100;
  depRows = [];
  KR.data.forEach(d => {
    const dep = d.cpi + d.m2_growth * 0.732;
    cumValue *= (1 - dep / 100);
    depRows.push({ ...d, dep, cumValue });
  });
  updateDepTable(2005, 10000);

  const totalDep = 100 - depRows[depRows.length - 1].cumValue;
  const avgDep = depRows.reduce((s, r) => s + r.dep, 0) / depRows.length;
  document.getElementById('depreciation-summary').innerHTML = `
    <div class="result-card">
      <div class="label">20년간 누적 화폐가치 하락</div>
      <div class="value" style="color:var(--red)">${totalDep.toFixed(1)}%</div>
      <div class="label">2005년 100만원 → 현재 ${depRows[depRows.length-1].cumValue.toFixed(0)}만원 가치</div>
    </div>
    <div class="result-card">
      <div class="label">연평균 하락률</div>
      <div class="value" style="color:var(--gold)">${avgDep.toFixed(2)}%</div>
    </div>
    <div class="result-card">
      <div class="label">최대 하락 연도</div>
      <div class="value" style="color:var(--red)">${depRows.reduce((m, r) => r.dep > m.dep ? r : m).year}년</div>
      <div class="label">${depRows.reduce((m, r) => r.dep > m.dep ? r : m).dep.toFixed(2)}%</div>
    </div>`;

  new Chart(document.getElementById('chart-depreciation'), {
    type: 'line',
    data: {
      labels: depRows.map(r => r.year),
      datasets: [
        { label: '100만원의 실질 가치 (만원)', data: depRows.map(r => r.cumValue),
          borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.3 },
        { label: '연간 하락률 (%)', data: depRows.map(r => r.dep),
          borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.3)', type: 'bar', yAxisID: 'y1' }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#e2e8f0' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { position: 'left', title: { display: true, text: '잔존가치 (만원)', color: '#ef4444' },
          ticks: { color: '#ef4444' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y1: { position: 'right', title: { display: true, text: '하락률 (%)', color: '#f59e0b' },
          ticks: { color: '#f59e0b' }, grid: { drawOnChartArea: false } }
      }
    }
  });
}

function updateDepTable(baseYear, amount) {
  const tbody = document.querySelector('#depreciation-table tbody');
  const baseIdx = depRows.findIndex(r => r.year === baseYear);
  const baseCum = depRows[baseIdx].cumValue;
  tbody.innerHTML = depRows.map((r, i) => {
    const ratio = r.cumValue / baseCum;
    const equiv = Math.round(amount * (baseCum / r.cumValue));
    const isBase = r.year === baseYear;
    return `<tr style="${isBase ? 'background:rgba(245,158,11,0.08)' : ''}">
      <td style="font-weight:600">${r.year}</td>
      <td>${r.cpi.toFixed(1)}</td><td>${r.m2_growth.toFixed(1)}</td>
      <td class="neg" style="font-weight:600">-${r.dep.toFixed(2)}%</td>
      <td style="color:${r.cumValue < 50 ? 'var(--red)' : 'var(--gold)'};font-weight:600">${r.cumValue.toFixed(2)}</td>
      <td style="font-weight:600;color:${i < baseIdx ? 'var(--green)' : i > baseIdx ? 'var(--red)' : 'var(--gold)'}">
        ${isBase ? '▶ ' : ''}${equiv.toLocaleString()}원
        ${!isBase ? '<span style="font-size:.7rem;color:var(--text2)">(' + (i < baseIdx ? '과거 등가' : '미래 등가') + ')</span>' : '<span style="font-size:.7rem">(기준)</span>'}
      </td>
    </tr>`;
  }).join('');
}

function setupDepCalc() {
  const sel = document.getElementById('dep-calc-year');
  const inp = document.getElementById('dep-calc-amount');
  const lbl = document.getElementById('dep-calc-label');
  sel.innerHTML = depRows.map(r => `<option value="${r.year}">${r.year}년</option>`).join('');
  sel.value = 2012;
  inp.value = 2000;
  function update() {
    const yr = parseInt(sel.value);
    const amt = parseInt(inp.value) || 10000;
    lbl.textContent = amt.toLocaleString() + '원';
    updateDepTable(yr, amt);
  }
  sel.addEventListener('change', update);
  inp.addEventListener('input', update);
  update();
}

// ===== ETF SIMULATION =====
function computeCAGR(returns) {
  let cum = 1;
  returns.forEach(r => { cum *= (1 + r.return / 100); });
  return (Math.pow(cum, 1 / returns.length) - 1);
}

function getETFStats() {
  const etfs = ['QQQ', 'SCHD', 'SPHD'];
  return etfs.map(key => {
    const data = ETF.etfs[key];
    const cagr = computeCAGR(data.returns);
    return {
      key, cagr, color: key === 'QQQ' ? '#06b6d4' : key === 'SCHD' ? '#10b981' : '#8b5cf6',
      name: data.name, desc: data.description,
      divType: data.dividend_type,
      divYield: data.annual_dividend_yield,
      dataYears: data.returns.length,
      startYear: data.returns[0].year,
      endYear: data.returns[data.returns.length - 1].year
    };
  });
}

function simulateETF(monthlyWon) {
  const stats = getETFStats();
  const years = 30;
  const totalPayments = years * 12;
  return stats.map(etf => {
    const monthlyGrowth = Math.pow(1 + etf.cagr, 1/12) - 1;
    let total = 0;
    const timeline = [];
    for (let m = 1; m <= totalPayments; m++) {
      total += monthlyWon;
      total *= (1 + monthlyGrowth);
      if (m % 12 === 0) timeline.push(Math.round(total));
    }
    const invested = monthlyWon * totalPayments;
    return { ...etf, total: Math.round(total), invested, timeline, totalPayments,
      roi: ((total - invested) / invested * 100) };
  });
}

function renderETFSim() {
  // Render actual stats table
  const stats = getETFStats();
  const infoTable = document.querySelector('#etf-sim .card table tbody');
  if (infoTable) {
    infoTable.innerHTML = stats.map(s =>
      `<tr><td style="color:${s.color};font-weight:600">${s.key}</td>
       <td>${s.divType}</td>
       <td>${s.divYield}%</td>
       <td style="color:var(--gold);font-weight:600">${(s.cagr * 100).toFixed(1)}%</td>
       <td>${s.desc} <span style="font-size:.7rem;color:var(--text2)">(${s.startYear}~${s.endYear}, ${s.dataYears}년 실적)</span></td></tr>`
    ).join('');
  }
  // Update header
  const infoHead = document.querySelector('#etf-sim .card table thead');
  if (infoHead) {
    infoHead.innerHTML = '<tr><th>ETF</th><th>배당 주기</th><th>연 배당률</th><th>실제 CAGR</th><th>설명</th></tr>';
  }

  const input = document.getElementById('monthly-input');
  const slider = document.getElementById('monthly-slider');
  const display = document.getElementById('monthly-display');
  function update() {
    const val = parseInt(input.value) || 100;
    display.textContent = val.toLocaleString() + '만원';
    const results = simulateETF(val);
    renderETFResults(results);
    renderETFChart(results);
  }
  input.addEventListener('input', () => { slider.value = input.value; update(); });
  slider.addEventListener('input', () => { input.value = slider.value; update(); });
  update();
}

function renderETFResults(results) {
  const fx = 1363;
  document.getElementById('etf-results').innerHTML = results.map(r => {
    const krwTotal = r.total * fx;
    const krwInvested = r.invested * fx;
    return `<div class="result-card">
      <div class="label" style="color:${r.color};font-weight:600">${r.key} <span style="font-size:.7rem;color:var(--text2)">CAGR ${(r.cagr*100).toFixed(1)}%</span></div>
      <div class="value" style="color:${r.color}">${(r.total / 10000).toFixed(1)}억</div>
      <div class="label">≈ ${(krwTotal / 100000000).toFixed(1)}억원 <span style="font-size:.7rem">(₩${fx}/$ 기준)</span></div>
      <div class="label">납입: ${r.totalPayments}회 × ${(r.invested / r.totalPayments).toLocaleString()}만원 = <b>${(r.invested / 10000).toFixed(1)}억</b></div>
      <div class="label" style="color:var(--green)">수익률: +${r.roi.toFixed(0)}%</div>
    </div>`;
  }).join('');
  document.getElementById('etf-krw-note').innerHTML =
    `💱 환율 기준: <b>₩${fx}/$</b> (2024년 연평균) · 시뮬레이션은 각 ETF의 <b>실제 과거 CAGR(총수익률 기준)</b>을 사용합니다.`;
}

let etfChart = null;
function renderETFChart(results) {
  if (etfChart) etfChart.destroy();
  const labels = Array.from({length: 30}, (_, i) => `${i+1}년`);
  etfChart = new Chart(document.getElementById('chart-etf-sim'), {
    type: 'line',
    data: {
      labels,
      datasets: results.map(r => ({
        label: r.key,
        data: r.timeline,
        borderColor: r.color,
        backgroundColor: r.color + '15',
        fill: true, tension: 0.3
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#e2e8f0' } },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${(ctx.parsed.y / 10000).toFixed(1)}억원`
          }
        }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8', callback: v => (v/10000).toFixed(0) + '억' },
          grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// ===== ETF BACKTEST TABLE =====
function renderETFBacktest() {
  const thead = document.querySelector('#etf-backtest-table thead');
  const tbody = document.querySelector('#etf-backtest-table tbody');
  thead.innerHTML = `<tr><th>연도</th><th>QQQ</th><th>SCHD</th><th>SPHD</th><th>S&P 500</th></tr>`;

  const qqq = ETF.etfs.QQQ.returns;
  const schd = ETF.etfs.SCHD.returns;
  const sphd = ETF.etfs.SPHD.returns;
  const spy = ETF.spy_benchmark.returns;

  const allYears = spy.map(s => s.year);
  tbody.innerHTML = allYears.map(year => {
    const q = qqq.find(r => r.year === year);
    const s = schd.find(r => r.year === year);
    const p = sphd.find(r => r.year === year);
    const sp = spy.find(r => r.year === year);
    const fmt = v => v ? `<td class="${v.return >= 0 ? 'pos' : 'neg'}">${v.return >= 0 ? '+' : ''}${v.return.toFixed(2)}%</td>` : '<td style="color:var(--text2)">-</td>';
    return `<tr><td style="font-weight:600">${year}</td>${fmt(q)}${fmt(s)}${fmt(p)}${fmt(sp)}</tr>`;
  }).join('');
}

// ===== TOP 10 STRATEGY =====
function renderTop10() {
  const data = TOP10.yearly;
  // Calculate cumulative
  let portfolio = 10000, spy = 10000;
  const cum = data.map(d => {
    portfolio *= (1 + d.portfolio_return / 100);
    spy *= (1 + d.spy_return / 100);
    return { year: d.year, portfolio: Math.round(portfolio), spy: Math.round(spy) };
  });

  // Summary
  const finalP = cum[cum.length - 1].portfolio;
  const finalS = cum[cum.length - 1].spy;
  const cagr_p = (Math.pow(finalP / 10000, 1 / data.length) - 1) * 100;
  const cagr_s = (Math.pow(finalS / 10000, 1 / data.length) - 1) * 100;

  const top10fx = parseFloat(document.getElementById('top10-exchange').value) || 1363;
  document.getElementById('top10-summary').innerHTML = `
    <div class="result-card">
      <div class="label">Top10 전략 (2005→2024)</div>
      <div class="value" style="color:var(--gold)">$${(finalP).toLocaleString()}</div>
      <div class="label">≈ ₩${Math.round(finalP * top10fx).toLocaleString()}</div>
      <div class="label">$10,000 → CAGR ${cagr_p.toFixed(1)}%</div>
    </div>
    <div class="result-card">
      <div class="label">S&P 500 벤치마크</div>
      <div class="value" style="color:var(--cyan)">$${(finalS).toLocaleString()}</div>
      <div class="label">≈ ₩${Math.round(finalS * top10fx).toLocaleString()}</div>
      <div class="label">$10,000 → CAGR ${cagr_s.toFixed(1)}%</div>
    </div>
    <div class="result-card">
      <div class="label">전략 초과수익</div>
      <div class="value" style="color:${cagr_p > cagr_s ? 'var(--green)' : 'var(--red)'}">
        ${cagr_p > cagr_s ? '+' : ''}${(cagr_p - cagr_s).toFixed(1)}%p
      </div>
      <div class="label">연간 CAGR 차이</div>
    </div>`;

  // Chart
  new Chart(document.getElementById('chart-top10'), {
    type: 'line',
    data: {
      labels: cum.map(c => c.year),
      datasets: [
        {
          label: 'Top10 동일비중',
          data: cum.map(c => c.portfolio),
          borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)',
          fill: true, tension: 0.3
        },
        {
          label: 'S&P 500',
          data: cum.map(c => c.spy),
          borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.1)',
          fill: true, tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#e2e8f0' } },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}` } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8', callback: v => '$' + (v/1000).toFixed(0) + 'K' },
          grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });

  // Table
  const thead = document.querySelector('#top10-table thead');
  const tbody = document.querySelector('#top10-table tbody');
  thead.innerHTML = `<tr><th>연도</th><th style="min-width:440px">Top 10 종목 (순위 · 개별 수익률)</th><th>포트폴리오</th><th>S&P 500</th><th>초과수익</th></tr>`;
  tbody.innerHTML = data.map(d => {
    const diff = d.portfolio_return - d.spy_return;
    // 4열 x 3행 미니 테이블 (10종목, 마지막행 2칸 비움)
    const cols = 4;
    const rows = Math.ceil(d.top10.length / cols);
    let miniRows = '';
    for (let row = 0; row < rows; row++) {
      let cells = '';
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        if (idx < d.top10.length) {
          const t = d.top10[idx], r = d.returns[idx], rank = idx + 1;
          cells += `<td style="padding:2px 5px;border:none;white-space:nowrap">
            <span style="color:var(--text2);font-size:.68rem;margin-right:1px">${rank}.</span>
            <span style="font-weight:600;color:var(--text)">${t}</span>
            <span style="color:${r >= 0 ? 'var(--green)' : 'var(--red)'};font-size:.72rem;margin-left:2px">${r >= 0 ? '+' : ''}${r.toFixed(1)}%</span></td>`;
        } else {
          cells += '<td style="border:none"></td>';
        }
      }
      miniRows += `<tr style="border:none">${cells}</tr>`;
    }
    const miniTable = `<table style="width:100%;border-collapse:collapse;font-size:.78rem">${miniRows}</table>`;
    return `<tr>
      <td style="font-weight:600">${d.year}</td>
      <td style="padding:4px 6px">${miniTable}</td>
      <td class="${d.portfolio_return >= 0 ? 'pos' : 'neg'}" style="font-weight:600">${d.portfolio_return >= 0 ? '+' : ''}${d.portfolio_return.toFixed(1)}%</td>
      <td class="${d.spy_return >= 0 ? 'pos' : 'neg'}">${d.spy_return >= 0 ? '+' : ''}${d.spy_return.toFixed(1)}%</td>
      <td class="${diff >= 0 ? 'pos' : 'neg'}" style="font-weight:600">${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%p</td>
    </tr>`;
  }).join('');

  // 환율 변경 시 리렌더링
  document.getElementById('top10-exchange').addEventListener('input', renderTop10);
}

// ===== ETF BACKTEST CALCULATOR =====
function setupBtCalc() {
  const sel = document.getElementById('bt-start-year');
  const inp = document.getElementById('bt-amount');
  const fxInp = document.getElementById('bt-exchange');
  const spy = ETF.spy_benchmark.returns;
  sel.innerHTML = spy.map(s => `<option value="${s.year}">${s.year}년</option>`).join('');
  sel.value = 2015;

  function update() {
    const startYear = parseInt(sel.value);
    const amount = parseFloat(inp.value) || 10000;
    const fx = parseFloat(fxInp.value) || 1363;
    const etfKeys = ['QQQ', 'SCHD', 'SPHD'];
    const colors = { QQQ: '#06b6d4', SCHD: '#10b981', SPHD: '#8b5cf6' };

    // Calculate cumulative for each ETF from startYear
    const results = etfKeys.map(key => {
      const returns = ETF.etfs[key].returns;
      let val = amount;
      const yearly = [{ year: startYear, val: amount }];
      for (let y = startYear; y <= 2024; y++) {
        const r = returns.find(x => x.year === y);
        if (r) { val *= (1 + r.return / 100); yearly.push({ year: y + 1, val }); }
      }
      return { key, final: val, yearly, roi: ((val - amount) / amount * 100) };
    });

    // Also SPY
    let spyVal = amount;
    for (let y = startYear; y <= 2024; y++) {
      const r = spy.find(x => x.year === y);
      if (r) spyVal *= (1 + r.return / 100);
    }

    document.getElementById('bt-results').innerHTML = results.map(r =>
      `<div class="result-card">
        <div class="label" style="color:${colors[r.key]};font-weight:600">${r.key}</div>
        <div class="value" style="color:${colors[r.key]}">$${Math.round(r.final).toLocaleString()}</div>
        <div class="label">≈ ₩${Math.round(r.final * fx).toLocaleString()}</div>
        <div class="label" style="color:var(--green)">+${r.roi.toFixed(1)}%</div>
      </div>`
    ).join('') + `<div class="result-card">
      <div class="label" style="color:var(--text2);font-weight:600">S&P 500</div>
      <div class="value">$${Math.round(spyVal).toLocaleString()}</div>
      <div class="label">≈ ₩${Math.round(spyVal * fx).toLocaleString()}</div>
      <div class="label" style="color:var(--green)">+${(((spyVal-amount)/amount)*100).toFixed(1)}%</div>
    </div>`;

    // Detail table with historical exchange rates
    const thead = document.querySelector('#bt-detail-table thead');
    const tbody = document.querySelector('#bt-detail-table tbody');
    thead.innerHTML = `<tr><th>연도</th><th>환율(₩/$)</th><th>QQQ</th><th>SCHD</th><th>SPHD</th><th>S&P 500</th></tr>`;
    let sv = amount;
    const spyYearly = [{ year: startYear, val: amount }];
    for (let y = startYear; y <= 2024; y++) {
      const r = spy.find(x => x.year === y);
      if (r) { sv *= (1 + r.return / 100); spyYearly.push({ year: y + 1, val: sv }); }
    }
    const years = [];
    for (let y = startYear; y <= 2025; y++) years.push(y);
    // Get exchange rate for year (use FX data, last known for 2025)
    const getFx = (y) => {
      const f = FX.data.find(x => x.year === y);
      if (f) return f.rate;
      if (y > 2024) return FX.data[FX.data.length - 1].rate;
      return FX.data[0].rate;
    };
    tbody.innerHTML = years.map(y => {
      const fxRate = getFx(y);
      const fxCell = `<td style="color:var(--purple);font-weight:500">${fxRate.toLocaleString()}</td>`;
      const vals = results.map(r => {
        const e = r.yearly.find(x => x.year === y);
        if (!e) return '<td>-</td>';
        const krw = Math.round(e.val * fxRate);
        return `<td class="${e.val >= amount ? 'pos' : 'neg'}">$${Math.round(e.val).toLocaleString()}<br><span style="font-size:.7rem;color:var(--text2)">₩${krw.toLocaleString()}</span></td>`;
      });
      const se = spyYearly.find(x => x.year === y);
      const sv2 = se ? `<td>$${Math.round(se.val).toLocaleString()}<br><span style="font-size:.7rem;color:var(--text2)">₩${Math.round(se.val * fxRate).toLocaleString()}</span></td>` : '<td>-</td>';
      return `<tr><td style="font-weight:600">${y}</td>${fxCell}${vals.join('')}${sv2}</tr>`;
    }).join('');
  }

  sel.addEventListener('change', update);
  inp.addEventListener('input', update);
  fxInp.addEventListener('input', update);
  update();
}

// ===== SCROLL ANIMATION =====
function setupObserver() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// ===== INIT =====
loadData();
