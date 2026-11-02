# 이 저장소에서 작업할 때

Jekyll 블로그 + 정적 웹앱 모음 (GitHub Pages 기본 빌드, Jekyll 3.10 / `github-pages` gem 기준). 자세한 내용은 README.md.

## 웹앱을 추가 · 수정할 때

- 앱 하나 = `webapps/<slug>/index.html` 파일 하나. **front matter 없는 순수 HTML** 로 둔다.
- **`app.html` 을 만들지 않는다.** `layout:` 을 붙인 미리보기 복사본도 만들지 않는다. (예전 방식, 폐지됨)
- `<head>` 에 `<script src="/assets/js/analytics.js" defer></script>` 한 줄을 넣는다.
- 목록 등록은 `_data/apps.yml` 에 항목 하나 추가로 끝. 단축 주소는 같은 항목의 `alias`.
  `redirect/` 폴더, 카테고리별 include, 홈 화면 수정은 필요 없다.
- 새 앱이면 `date:` 에 오늘 날짜(YYYY-MM-DD)를 적는다 (NEW 표시용).

## 그 밖에

- 그림 작품: `webapps/drawing/img/*.md` (`layout: artwork`). 원본 PNG 는 매우 크므로 페이지에는 `_web.webp` 를 쓴다.
- 글: `_posts/YYYY-MM-DD-제목.md` + `category:`.
- 옛 주소 처리는 `404.html` → `_includes/resolver.html` (+ `_data/redirects.yml`). 기존 공개 주소를 바꾸거나 지울 땐 여기에 옮겨 둔다.
- 스타일은 `assets/css/site.css` (순수 CSS, Sass 없음). 색은 `:root` 변수로, 다크 모드는 `prefers-color-scheme`.
- Liquid 는 Jekyll 3.10(Liquid 4) 문법만 쓴다. 주석 안의 `{% include %}` 도 실행되니 지운 include 를 남기지 않는다.
