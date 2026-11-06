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
//   [data-filter]      카테고리 칩 (all | 카테고리 id). data-aliases="옛id ..." 면 옛 주소(#옛id)도 이 칩으로
//   [data-item]        항목. data-cat, data-search, data-tags("|태그|태그|") 로 거른다
//   [data-tag]         누르면 그 태그(시리즈)끼리 모아 보기. ?tag=값 으로 공유 가능
//   [data-group]       항목 묶음(섹션). 보이는 항목이 없으면 숨김
//   [data-search-input], [data-empty], [data-active-tag]  (선택) 검색창, 결과 없음 문구, 모아 보기 표시
(function () {
  var root = document.querySelector('[data-filterable]');
  if (!root) {
    // 목록이 없는 페이지(글 등)의 카드에서 태그를 누르면 홈에서 모아 보기
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-tag]');
      if (b) { e.preventDefault(); location.href = '/?tag=' + encodeURIComponent(b.getAttribute('data-tag')); }
    });
    return;
  }

  var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter]'));
  var items = Array.prototype.slice.call(root.querySelectorAll('[data-item]'));
  var groups = Array.prototype.slice.call(root.querySelectorAll('[data-group]'));
  var input = root.querySelector('[data-search-input]');
  var empty = root.querySelector('[data-empty]');
  var pill = root.querySelector('[data-active-tag]');
  var pillLabel = pill && pill.querySelector('[data-active-tag-label]');
  var current = 'all';
  var tag = null;

  function apply() {
    var terms = (input ? input.value : '').toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;

    items.forEach(function (el) {
      var hay = el.getAttribute('data-search') || el.textContent.toLowerCase();
      var ok = (current === 'all' || el.getAttribute('data-cat') === current) &&
        (!tag || (el.getAttribute('data-tags') || '').indexOf('|' + tag + '|') !== -1) &&
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
    root.querySelectorAll('[data-tag]').forEach(function (b) {
      var on = b.getAttribute('data-tag') === tag;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (pill) { pill.hidden = !tag; }
  }

  // 칩 id 찾기: 지금 id 이거나 data-aliases 에 적힌 옛 id
  function resolve(id) {
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i], aliases = (c.getAttribute('data-aliases') || '').split(/\s+/);
      if (c.getAttribute('data-filter') === id || aliases.indexOf(id) !== -1) { return c.getAttribute('data-filter'); }
    }
    return null;
  }

  // 휴대폰에서 칩 줄이 가로로 넘칠 때, 선택된 칩이 보이도록 줄만 가로로 민다
  function revealActiveChip() {
    var strip = root.querySelector('.filters');
    var act = strip && strip.querySelector('.is-active');
    if (!act || strip.scrollWidth <= strip.clientWidth) { return; }
    strip.scrollLeft += act.getBoundingClientRect().left - strip.getBoundingClientRect().left - 16;
  }

  function url() {
    var q = new URLSearchParams(location.search);
    if (tag) { q.set('tag', tag); } else { q.delete('tag'); }
    var qs = q.toString();
    return location.pathname + (qs ? '?' + qs : '') + (current === 'all' ? '' : '#' + current);
  }

  function select(id, updateUrl) {
    current = resolve(id) || 'all';
    apply();
    revealActiveChip();
    if (updateUrl) { history.replaceState(null, '', url()); }
  }

  function setTag(value, label, updateUrl) {
    tag = value || null;
    if (pillLabel) { pillLabel.textContent = label || value || ''; }
    apply();
    if (updateUrl) { history.replaceState(null, '', url()); }
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

  // 태그 · 시리즈 버튼 (카드 안): 누르면 모아 보기, 같은 것을 다시 누르면 해제
  root.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-tag]');
    if (!b || !root.contains(b)) { return; }
    e.preventDefault();
    var v = b.getAttribute('data-tag');
    setTag(v === tag ? null : v, b.getAttribute('data-tag-label'), true);
    if (toolbar && tag) { toolbar.scrollIntoView({ block: 'nearest' }); }
  });
  var clear = root.querySelector('[data-active-tag-clear]');
  if (clear) { clear.addEventListener('click', function () { setTag(null, '', true); }); }

  if (input) {
    input.addEventListener('input', apply);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; apply(); input.blur(); }
    });
    // '/' 키로 검색창 바로 가기
    document.addEventListener('keydown', function (e) {
      var t = (document.activeElement && document.activeElement.tagName) || '';
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(t) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  // wbpark.app/#make 처럼 해시로 들어오면 그 카테고리만 보여준다 (뒤로 가기 · 해시 링크 포함).
  // 카테고리가 아닌 해시(#main 같은 본문 바로가기 등)는 필터를 건드리지 않는다.
  function fromHash() {
    var id = '';
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (e) {}
    if (!id) { select('all', false); } else if (resolve(id)) { select(id, false); }
  }
  window.addEventListener('hashchange', fromHash);

  // ?tag=three.js 로 들어오면 그 태그끼리 모아 보기
  var q = new URLSearchParams(location.search).get('tag');
  if (q) {
    q = q.toLowerCase();
    var src = null;
    root.querySelectorAll('[data-tag]').forEach(function (b) { if (!src && b.getAttribute('data-tag') === q) { src = b; } });
    setTag(q, src ? src.getAttribute('data-tag-label') : q, false);
  }
  apply();
  fromHash();
})();

// NEW · 업데이트 표시: 빌드 때 붙인 배지라도 기한(data-new-until, 초)이 지났으면 브라우저에서 뗀다
(function () {
  var now = Date.now() / 1000;
  var badges = document.querySelectorAll('[data-new-until]');
  for (var i = 0; i < badges.length; i++) {
    if (Number(badges[i].getAttribute('data-new-until')) < now) { badges[i].parentNode.removeChild(badges[i]); }
  }
})();

// 카드의 '공유' 버튼: 단축 주소 복사 · QR 보기/저장 · (휴대폰) 다른 앱으로 공유
//   [data-share="주소"] [data-share-title="이름"] → _includes/share-dialog.html 의 창
(function () {
  var dlg = document.getElementById('share-dialog');
  if (!dlg) { return; }
  var input = dlg.querySelector('[data-share-input]');
  var nameEl = dlg.querySelector('[data-share-name]');
  var qrBox = dlg.querySelector('[data-share-qr]');
  var status = dlg.querySelector('[data-share-status]');
  var dl = dlg.querySelector('[data-share-download]');
  var native = dlg.querySelector('[data-share-native]');
  var cur = { url: '', title: '' };
  var qrLib = null;

  function loadQR() {
    if (window.QRCode) { return Promise.resolve(window.QRCode); }
    if (!qrLib) {
      qrLib = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = '/assets/js/lib/qrcode.min.js';
        s.onload = function () { resolve(window.QRCode); };
        s.onerror = function () { qrLib = null; reject(new Error('qr')); };
        document.head.appendChild(s);
      });
    }
    return qrLib;
  }

  function say(msg) { status.textContent = msg; }

  function open(url, title) {
    cur = { url: url, title: title || '' };
    input.value = url;
    nameEl.textContent = cur.title;
    say('');
    qrBox.textContent = '';
    dl.hidden = true;
    native.hidden = !navigator.share;
    if (typeof dlg.showModal === 'function') { dlg.showModal(); } else { dlg.setAttribute('open', ''); }
    loadQR().then(function (QR) {
      var c = document.createElement('canvas');
      return QR.toCanvas(c, url, { width: 200, margin: 2, errorCorrectionLevel: 'M' }).then(function () {
        if (cur.url !== url) { return; }
        qrBox.appendChild(c);
        dl.href = c.toDataURL('image/png');
        dl.download = 'qr-' + (url.replace(/^https?:\/\/[^/]+\/?/, '').replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '') || 'wbpark') + '.png';
        dl.hidden = false;
      });
    }).catch(function () { qrBox.textContent = 'QR 코드를 만들지 못했어요'; });
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-share]');
    if (!b) { return; }
    e.preventDefault();
    open(b.getAttribute('data-share'), b.getAttribute('data-share-title'));
  });

  dlg.querySelector('[data-share-copy]').addEventListener('click', function () {
    var done = function () { say('주소를 복사했어요'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cur.url).then(done, function () { input.select(); say('Ctrl+C 로 복사하세요'); });
    } else {
      input.select();
      try { document.execCommand('copy'); done(); } catch (e) { say('Ctrl+C 로 복사하세요'); }
    }
  });
  native.addEventListener('click', function () {
    navigator.share({ title: cur.title, url: cur.url }).catch(function () {});
  });
  // 창 바깥(배경)을 누르면 닫기
  dlg.addEventListener('click', function (e) { if (e.target === dlg) { dlg.close(); } });
})();
