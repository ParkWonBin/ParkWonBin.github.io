// 앱 화면 구석에 '← wbpark' 작은 표시를 띄워 블로그 홈으로 돌아갈 수 있게 한다.
//
//   <script src="/assets/js/app-bar.js" defer></script>                          왼쪽 아래 (기본)
//   <script src="/assets/js/app-bar.js" defer data-pos="br"></script>            bl · br · tl · tr (아래/위 + 왼/오른쪽)
//   <script src="/assets/js/app-bar.js" defer data-pos="br" data-pos-m="tl"></script>  휴대폰(폭 600px 이하)에서는 다른 구석
//   data-pos="none" 이면 띄우지 않는다.
//
// 앱의 버튼을 가리지 않도록 몇 초 뒤 로고만 남게 줄어들고, 마우스를 올리거나 포커스하면 다시 펼쳐진다.
// 다른 페이지 안(iframe)에서 열렸을 때와 인쇄할 때는 나타나지 않는다.
(function () {
  var me = document.currentScript;
  var attr = function (n, d) { var v = me && me.getAttribute(n); return (v || d).toLowerCase(); };
  var pos = attr('data-pos', 'bl');
  var posM = attr('data-pos-m', pos);
  if ((pos === 'none' && posM === 'none') || window.top !== window.self) { return; }

  var css =
    '.wbpark-appbar{all:initial;position:fixed;' +
    'z-index:2147483000;display:flex;align-items:center;gap:6px;height:30px;max-width:140px;padding:0 11px 0 7px;box-sizing:border-box;border-radius:999px;' +
    'background:rgba(22,22,26,.86);color:#fff;' +   /* WebGL 캔버스 위에서 깨지지 않게 흐림 효과는 쓰지 않는다 */
    'font:600 13px/30px -apple-system,BlinkMacSystemFont,system-ui,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;' +
    'text-decoration:none;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.25);opacity:.92;overflow:hidden;white-space:nowrap;' +
    'transition:max-width .25s ease,padding .25s ease,opacity .2s ease}' +
    '.wbpark-appbar:hover,.wbpark-appbar:focus-visible{opacity:1;max-width:140px;padding:0 11px 0 7px}' +
    '.wbpark-appbar:focus-visible{outline:2px solid #8aa9ff;outline-offset:2px}' +
    '.wbpark-appbar.is-mini{max-width:30px;padding:0 0 0 7px;opacity:.7}' +
    '.wbpark-appbar.is-mini:hover,.wbpark-appbar.is-mini:focus-visible{max-width:140px;padding:0 11px 0 7px;opacity:1}' +
    '.wbpark-appbar__logo{all:initial;flex:0 0 16px;width:16px;height:16px;background:#fff;' +
    '-webkit-mask:url(/assets/images/logo.svg) center/contain no-repeat;mask:url(/assets/images/logo.svg) center/contain no-repeat}' +
    '.wbpark-appbar__text{all:initial;color:inherit;font:inherit}' +
    '.wbpark-appbar--tl,.wbpark-appbar--tr{top:calc(12px + env(safe-area-inset-top,0px))}' +
    '.wbpark-appbar--bl,.wbpark-appbar--br{bottom:calc(12px + env(safe-area-inset-bottom,0px))}' +
    '.wbpark-appbar--tl,.wbpark-appbar--bl{left:calc(12px + env(safe-area-inset-left,0px))}' +
    '.wbpark-appbar--tr,.wbpark-appbar--br{right:calc(12px + env(safe-area-inset-right,0px))}' +
    '.wbpark-appbar--none{display:none}' +
    '@media print{.wbpark-appbar{display:none}}' +
    '@media (prefers-reduced-motion:reduce){.wbpark-appbar{transition:none}}';

  function mount() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var a = document.createElement('a');
    a.className = 'wbpark-appbar';
    a.href = '/';
    a.title = 'wbpark 블로그 홈으로';
    a.setAttribute('aria-label', 'wbpark 블로그 홈으로');
    a.innerHTML = '<span class="wbpark-appbar__logo" aria-hidden="true"></span><span class="wbpark-appbar__text">← wbpark</span>';
    document.body.appendChild(a);

    // 화면 폭에 따라 구석 바꾸기
    var mq = window.matchMedia ? window.matchMedia('(max-width: 600px)') : null;
    var place = function () {
      var p = mq && mq.matches ? posM : pos;
      a.className = a.className.replace(/\s*wbpark-appbar--\w+/g, '') + ' wbpark-appbar--' + (/^(tl|tr|bl|br|none)$/.test(p) ? p : 'bl');
    };
    place();
    if (mq) { if (mq.addEventListener) { mq.addEventListener('change', place); } else if (mq.addListener) { mq.addListener(place); } }
    setTimeout(function () { a.classList.add('is-mini'); }, 4000);
  }
  if (document.body) { mount(); } else { document.addEventListener('DOMContentLoaded', mount); }
})();
