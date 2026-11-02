---
# 블로그 페이지와 모든 웹앱이 같이 쓰는 Google Analytics 로더.
# 웹앱은 <head> 안에 아래 한 줄만 넣으면 됩니다.
#   <script src="/assets/js/analytics.js" defer></script>
# 실제 도메인(wbpark.app)에서만 동작하므로 로컬 실행 중에는 통계가 쌓이지 않습니다.
---
(function () {
  var GA_ID = '{{ site.google_analytics }}';
  var HOST = '{{ site.url | remove: "https://" | remove: "http://" }}';
  if (!GA_ID || location.hostname !== HOST) { return; }

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);

  // 링크 클릭 추적 (GA4 커스텀 이벤트: link_click)
  // 클릭한 링크가 어느 영역에 있었는지 함께 기록한다.
  var AREAS = [
    ['.site-nav', '상단메뉴'],
    ['.brand', '상단로고'],
    ['.filters', '필터'],
    ['.app-card', '카드'],
    ['.art-card', '그림카드'],
    ['.post-item', '글목록'],
    ['.social', '소셜링크'],
    ['.site-footer', '푸터'],
    ['main', '본문']
  ];

  function areaOf(el) {
    for (var i = 0; i < AREAS.length; i++) {
      if (el.closest(AREAS[i][0])) { return AREAS[i][1]; }
    }
    return '기타';
  }

  function trim(text) {
    return (text || '').replace(/\s+/g, ' ').trim().slice(0, 100);
  }

  function onClick(event) {
    var target = event.target;
    if (!target || typeof target.closest !== 'function') { return; }

    var link = target.closest('a[href]');
    if (!link) { return; }
    if (/^(javascript:|mailto:|tel:|#)/i.test(link.getAttribute('href'))) { return; }

    var img = link.querySelector('img');
    window.gtag('event', 'link_click', {
      link_url: link.href.slice(0, 100),
      link_text: trim(link.innerText) || trim(img && img.alt),
      link_area: areaOf(link),
      link_classes: trim(link.getAttribute('class')) || '(none)',
      is_outbound: link.hostname !== location.hostname
    });
  }

  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true); // 휠클릭(새 탭)도 잡는다.
})();
