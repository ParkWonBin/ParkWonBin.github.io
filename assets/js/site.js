// 라이트 · 다크 토글
//   첫 테마는 _includes/head.html 의 인라인 스크립트가 정한다 (저장된 선택 → 시스템 설정).
//   버튼을 누르면 반대 테마로 바꾸고, 시스템 설정과 같아지면 저장을 지워 다시 시스템을 따른다.
(function () {
  var root = document.documentElement;
  var btn = document.querySelector('[data-theme-toggle]');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function system() { return mq && mq.matches ? 'dark' : 'light'; }
  function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function saved() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }

  function sync() {
    if (!btn) { return; }
    var label = current() === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('title', label);
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        if (next === system()) { localStorage.removeItem('theme'); } else { localStorage.setItem('theme', next); }
      } catch (e) {}
      sync();
    });
  }

  // 직접 고른 적이 없으면 시스템 설정이 바뀔 때 따라간다
  if (mq) {
    var follow = function () { if (!saved()) { root.setAttribute('data-theme', system()); sync(); } };
    if (mq.addEventListener) { mq.addEventListener('change', follow); } else if (mq.addListener) { mq.addListener(follow); }
  }
  sync();
})();

// 목록 필터 · 검색 (홈 웹앱 목록, 글 목록 공용)
//   [data-filterable]  감싸는 영역
//   [data-filter]      카테고리 칩 (all | 카테고리 id)
//   [data-item]        항목. data-cat, data-search 로 거른다
//   [data-group]       항목 묶음(섹션). 보이는 항목이 없으면 숨김
//   [data-search-input], [data-empty]  (선택) 검색창, 결과 없음 문구
(function () {
  var root = document.querySelector('[data-filterable]');
  if (!root) { return; }

  var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter]'));
  var items = Array.prototype.slice.call(root.querySelectorAll('[data-item]'));
  var groups = Array.prototype.slice.call(root.querySelectorAll('[data-group]'));
  var input = root.querySelector('[data-search-input]');
  var empty = root.querySelector('[data-empty]');
  var current = 'all';

  function apply() {
    var terms = (input ? input.value : '').toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;

    items.forEach(function (el) {
      var hay = el.getAttribute('data-search') || el.textContent.toLowerCase();
      var ok = (current === 'all' || el.getAttribute('data-cat') === current) &&
        terms.every(function (t) { return hay.indexOf(t) !== -1; });
      el.hidden = !ok;
      if (ok) { shown++; }
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('[data-item]:not([hidden])'); });
    if (empty) { empty.hidden = shown > 0; }
    chips.forEach(function (c) {
      var on = c.getAttribute('data-filter') === current;
      c.classList.toggle('is-active', on);
      if (on) { c.setAttribute('aria-current', 'true'); } else { c.removeAttribute('aria-current'); }
    });
  }

  function isChip(id) { return chips.some(function (c) { return c.getAttribute('data-filter') === id; }); }

  // 휴대폰에서 칩 줄이 가로로 넘칠 때, 선택된 칩이 보이도록 줄만 가로로 민다
  function revealActiveChip() {
    var strip = root.querySelector('.filters');
    var act = strip && strip.querySelector('.is-active');
    if (!act || strip.scrollWidth <= strip.clientWidth) { return; }
    strip.scrollLeft += act.getBoundingClientRect().left - strip.getBoundingClientRect().left - 16;
  }

  function select(id, updateUrl) {
    current = isChip(id) ? id : 'all';
    apply();
    revealActiveChip();
    if (updateUrl) {
      history.replaceState(null, '', current === 'all' ? location.pathname + location.search : '#' + current);
    }
  }

  // 고정된 검색바 높이를 CSS 에 알려, 앵커 이동 · 키보드 포커스가 검색바 밑으로 숨지 않게 한다
  var toolbar = root.querySelector('.toolbar');
  function measureToolbar() {
    var h = toolbar && getComputedStyle(toolbar).position === 'sticky' ? toolbar.offsetHeight : 0;
    document.documentElement.style.setProperty('--toolbar-h', h + 'px');
  }
  measureToolbar();
  window.addEventListener('resize', measureToolbar);

  chips.forEach(function (c) {
    c.addEventListener('click', function (e) {
      e.preventDefault();
      select(c.getAttribute('data-filter'), true);
    });
  });

  if (input) {
    input.addEventListener('input', apply);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; apply(); input.blur(); }
    });
    // '/' 키로 검색창 바로 가기
    document.addEventListener('keydown', function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(tag) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  // wbpark.app/#art 처럼 해시로 들어오면 그 카테고리만 보여준다 (뒤로 가기 · 해시 링크 포함).
  // 카테고리가 아닌 해시(#main 같은 본문 바로가기 등)는 필터를 건드리지 않는다.
  function fromHash() {
    var id = '';
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    if (!id) { select('all', false); } else if (isChip(id)) { select(id, false); }
  }
  window.addEventListener('hashchange', fromHash);
  apply();
  fromHash();
})();

// NEW 표시: 빌드 때 붙인 배지라도 기한(data-new-until, 초)이 지났으면 브라우저에서 뗀다
(function () {
  var now = Date.now() / 1000;
  var badges = document.querySelectorAll('[data-new-until]');
  for (var i = 0; i < badges.length; i++) {
    if (Number(badges[i].getAttribute('data-new-until')) < now) { badges[i].parentNode.removeChild(badges[i]); }
  }
})();
