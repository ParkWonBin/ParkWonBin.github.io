// 출처 각주 (나무위키 · 위키백과처럼 [1] 위첨자 + 아래 출처 목록)
//
// 쓰는 법 — 본문에서 근거가 필요한 문장 끝에:
//   <sup class="fn"><a href="/sources/#xie2013">[출처]</a></sup>
// 출처 자체(저자 · 제목 · 원문 링크)는 저장소 한 곳에서만 관리한다: _data/sources/<묶음>.yml → /sources.json, /sources/ 페이지
//
// 이 스크립트가 하는 일 (자바스크립트가 없으면 링크가 /sources/ 페이지의 그 항목으로 간다)
//   · 페이지에 나온 순서대로 [1] [2] … 번호를 매긴다 (같은 출처는 같은 번호)
//   · 누르거나(휴대폰) 마우스를 올리면 작은 창에 출처를 보여 준다. 창이 뜬 채로 한 번 더 누르면 아래 목록으로
//   · 페이지 끝(또는 <div data-footnotes></div> 자리)에 '출처' 목록을 만든다 — 각 항목에서 본문으로 되돌아가기(^)
//   · 앱이 나중에 그린 각주(표를 자바스크립트로 다시 그리는 경우 등)도 알아서 다시 센다
// 블로그 레이아웃에는 이미 들어 있고, 웹앱은 각주를 쓰는 페이지 <head> 에 이 한 줄을 넣는다:
//   <script src="/assets/js/footnotes.js" defer></script>
(function () {
  var SEL = 'sup.fn > a';
  var data = null, ready = null, list = null, ol = null, pop = null, popFor = null, pinned = false, hideT = 0, num = {}, order = [];

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  function idOf(a) {
    if (a.getAttribute('data-src')) { return a.getAttribute('data-src'); }
    var h = a.getAttribute('href') || '';
    if (h.indexOf('/sources/#') === -1) { return ''; }
    try { return decodeURIComponent(h.split('#')[1] || ''); } catch (e) { return ''; }
  }
  // 페이지 배경 밝기로 창 색을 고른다 (블로그 · 각 웹앱의 라이트/다크 어느 쪽이든)
  function dark() {
    var el = document.body, c = '';
    while (el && (!c || /rgba\(0, 0, 0, 0\)|transparent/.test(c))) { c = getComputedStyle(el).backgroundColor; el = el.parentElement; }
    var m = (c || '').match(/\d+(\.\d+)?/g);
    if (!m) { return document.documentElement.getAttribute('data-theme') === 'dark'; }
    return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) < 128;
  }
  function cite(s, id) {
    if (!s) { return '출처 정보를 찾지 못했어요 (' + esc(id) + ') · <a href="/sources/#' + encodeURIComponent(id) + '">출처 목록</a>'; }
    var parts = [];
    if (s.author) { parts.push(esc(s.author) + (s.year ? ' (' + esc(s.year) + ')' : '')); } else if (s.year) { parts.push('(' + esc(s.year) + ')'); }
    if (s.title) { parts.push('<cite>' + esc(s.title) + '</cite>'); }
    if (s.publisher) { parts.push(esc(s.publisher)); }
    var html = parts.join('. ') + '.';
    if (s.url) { html += ' <a href="' + esc(s.url) + '" target="_blank" rel="noopener">원문 ↗</a>'; }
    if (s.accessed) { html += ' <span style="opacity:.7">(' + esc(s.accessed) + ' 기준)</span>'; }
    if (s.note) { html += '<br><span style="opacity:.8">' + esc(s.note) + '</span>'; }
    return html;
  }

  function setup() {
    var style = document.createElement('style');
    style.textContent =
      'sup.fn{line-height:0;font-size:.72em;vertical-align:super;white-space:nowrap}' +
      'sup.fn a{color:inherit;opacity:.75;text-decoration:none;padding:0 1px;font-weight:600}' +
      'sup.fn a:hover,sup.fn a:focus-visible{opacity:1;text-decoration:underline}' +
      '.fn-pop{position:fixed;z-index:2147482000;max-width:min(360px,calc(100vw - 24px));padding:10px 12px;border-radius:10px;' +
      'font:13px/1.55 -apple-system,BlinkMacSystemFont,system-ui,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;' +
      'box-shadow:0 8px 24px rgba(0,0,0,.22);text-align:left;word-break:keep-all;overflow-wrap:anywhere}' +
      '.fn-pop a{text-decoration:underline}.fn-pop .fn-n{font-weight:700;margin-right:4px}' +
      '.fn-list{margin:40px 0 16px;padding-top:14px;border-top:1px solid rgba(127,127,127,.35);font-size:13.5px;line-height:1.6}' +
      '.fn-list h2{margin:0 0 8px;font-size:15px}.fn-list ol{margin:0;padding-left:28px}.fn-list li{margin:4px 0}' +
      '.fn-list li:target{outline:2px solid rgba(255,200,0,.6);outline-offset:2px;border-radius:4px}' +
      '.fn-list .fn-back{margin-right:6px;text-decoration:none;font-weight:700}' +
      '.fn-light{background:#fff;color:#1b1b1f;border:1px solid #ddd}.fn-light a{color:#2b5cdb}' +
      '.fn-dark{background:#22242a;color:#ececf0;border:1px solid #3b3c43}.fn-dark a{color:#8aa9ff}';
    document.head.appendChild(style);
    ready = fetch('/sources.json', { cache: 'force-cache' }).then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; }).then(function (d) { data = d || {}; return data; });
    var box = document.querySelector('[data-footnotes]');
    if (!box) {
      box = document.createElement('div');
      var host = document.querySelector('main') || document.body;
      var foot = host === document.body ? document.querySelector('body > footer') : null;
      if (foot) { host.insertBefore(box, foot); } else { host.appendChild(box); }
    }
    list = document.createElement('section');
    list.className = 'fn-list';
    list.setAttribute('aria-label', '출처');
    list.innerHTML = '<h2>출처</h2><ol></ol>';
    box.appendChild(list);
    ol = list.querySelector('ol');
    document.addEventListener('click', function (e) {
      if (pop && !pop.contains(e.target) && !(e.target.closest && e.target.closest('sup.fn'))) { close(); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { close(); } });
    window.addEventListener('resize', close);
    var raf = 0;
    window.addEventListener('scroll', function () { if (pop && !raf) { raf = requestAnimationFrame(function () { raf = 0; place(); }); } }, true);
  }

  function close() { if (pop) { pop.remove(); pop = null; popFor = null; pinned = false; } }
  // 창은 화면 기준(fixed)으로 각주 바로 위(자리가 없으면 아래)에 둔다. 스크롤하면 따라가고, 각주가 화면 밖으로 나가면 닫는다
  function place() {
    if (!pop || !popFor) { return; }
    var r = popFor.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) { close(); return; }
    var w = pop.offsetWidth, h = pop.offsetHeight;
    pop.style.left = Math.max(12, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 12)) + 'px';
    pop.style.top = (r.top - h - 8 < 8 ? r.bottom + 8 : r.top - h - 8) + 'px';
  }
  function show(a, pin) {
    clearTimeout(hideT);
    ready.then(function () {
      close();
      var id = a.getAttribute('data-src'), n = num[id];
      pop = document.createElement('div');
      pop.className = 'fn-pop ' + (dark() ? 'fn-dark' : 'fn-light');
      pop.setAttribute('role', 'note');
      pop.dataset.for = id;
      pop.innerHTML = '<span class="fn-n">[' + n + ']</span>' + cite(data[id], id) + ' · <a href="#fn-' + n + '">출처 목록</a>';
      document.body.appendChild(pop);
      popFor = a;
      place();
      pinned = !!pin;
      pop.addEventListener('mouseenter', function () { clearTimeout(hideT); });
      pop.addEventListener('mouseleave', function () { if (!pinned) { hideT = setTimeout(close, 200); } });
    });
  }
  var hover = window.matchMedia && matchMedia('(hover: hover)').matches;
  function bind(a) {
    if (a.dataset.fnBound) { return; }
    a.dataset.fnBound = '1';
    if (hover) {
      a.addEventListener('mouseenter', function () { show(a, false); });
      a.addEventListener('mouseleave', function () { if (!pinned) { hideT = setTimeout(close, 250); } });
    }
    a.addEventListener('click', function (e) {
      // 창이 이 각주로 고정돼 있으면 기본 동작(아래 출처 목록으로 이동), 아니면 창을 고정해서 보여 준다
      if (pop && pinned && pop.dataset.for === a.getAttribute('data-src')) { close(); return; }
      e.preventDefault();
      show(a, true);
    });
  }

  // 각주를 (다시) 센다: 번호 · 되돌아가기 자리 · 아래 목록
  function build() {
    var refs = Array.prototype.slice.call(document.querySelectorAll(SEL)).filter(function (a) { return idOf(a); });
    if (!refs.length) { return; }
    if (!list) { setup(); }
    order = []; num = {};
    refs.forEach(function (a) {
      var id = idOf(a);
      if (!(id in num)) { order.push(id); num[id] = order.length; }
      var n = num[id];
      a.setAttribute('data-src', id);
      a.setAttribute('href', '#fn-' + n);
      a.setAttribute('aria-label', '출처 ' + n);
      if (a.textContent !== '[' + n + ']') { a.textContent = '[' + n + ']'; }
      a.removeAttribute('id');
      bind(a);
    });
    order.forEach(function (id, i) {
      var first = refs.filter(function (a) { return a.getAttribute('data-src') === id; })[0];
      if (first && !document.getElementById('fnref-' + (i + 1))) { first.id = 'fnref-' + (i + 1); }
    });
    ready.then(function () {
      ol.innerHTML = '';
      order.forEach(function (id, i) {
        var li = document.createElement('li');
        li.id = 'fn-' + (i + 1);
        li.innerHTML = '<a class="fn-back" href="#fnref-' + (i + 1) + '" aria-label="본문으로">^</a>' + cite(data[id], id);
        ol.appendChild(li);
      });
    });
  }

  build();
  // 앱이 나중에 그린 각주도 센다 (각주 목록 안의 변화는 무시)
  var t = 0;
  new MutationObserver(function (muts) {
    for (var i = 0; i < muts.length; i++) {
      var m = muts[i];
      if (list && list.contains(m.target)) { continue; }
      for (var j = 0; j < m.addedNodes.length; j++) {
        var node = m.addedNodes[j];
        if (node.nodeType === 1 && (node.matches('sup.fn') || node.querySelector('sup.fn'))) { clearTimeout(t); t = setTimeout(build, 50); return; }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
