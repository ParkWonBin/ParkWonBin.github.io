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
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function select(id, updateUrl) {
    var known = chips.some(function (c) { return c.getAttribute('data-filter') === id; });
    current = known ? id : 'all';
    apply();
    if (updateUrl) {
      history.replaceState(null, '', current === 'all' ? location.pathname + location.search : '#' + current);
    }
  }

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

  // wbpark.app/#demo 처럼 해시로 들어오면 그 카테고리만 보여준다 (뒤로 가기 · 해시 링크 포함)
  function fromHash() { select(decodeURIComponent(location.hash.slice(1)) || 'all', false); }
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
