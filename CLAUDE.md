# 이 저장소에서 작업할 때

Jekyll 블로그 + 정적 웹앱 모음 (GitHub Pages 기본 빌드, Jekyll 3.10 / `github-pages` gem 기준). 자세한 내용은 README.md.

## 웹앱을 추가 · 수정할 때

- 앱 하나 = `webapps/<slug>/index.html` 파일 하나. **front matter 없는 순수 HTML** 로 둔다.
- **`app.html` 을 만들지 않는다.** `layout:` 을 붙인 미리보기 복사본도 만들지 않는다. (예전 방식, 폐지됨)
- 앱의 **모든 HTML 페이지**(여러 페이지짜리 앱이면 각 페이지마다) `<head>` 에 `<script src="/assets/js/analytics.js" defer></script>` 한 줄을 넣는다.
- 앱 진입 페이지에는 `<script src="/assets/js/app-bar.js" defer data-pos="bl"></script>` 도 넣는다 (블로그로 돌아가기 표시).
  앱 버튼과 겹치지 않는 구석으로 `data-pos` (bl · br · tl · tr), 휴대폰만 다르면 `data-pos-m`. 앱에 블로그 링크가 이미 있으면 생략.
- 목록 등록은 `_data/apps.yml` 에 항목 하나 추가로 끝. 단축 주소는 같은 항목의 `alias`.
  `redirect/` 폴더, 카테고리별 include, 홈 화면 수정은 필요 없다.
- 새 앱이면 `date:` 에 오늘 날짜(YYYY-MM-DD)를 적는다 (NEW 표시용). 기능을 크게 바꾸면 `updated:` (업데이트 표시).
- `usage:` 에 사용법 2~4줄(화면의 실제 버튼 이름을 ‘ ’ 로)을 적는다. 콜론이 들어가면 따옴표로 감싼다.
- 썸네일: (처음 한 번 `cd tools/check && npm ci && npx playwright install chromium`) 사이트를 띄우고 `node tools/thumbs.js --only <slug>` → `assets/thumbs/<slug>.webp`. 첫 화면이 비거나 내용이 구석에 작으면 `tools/thumbs.hooks.js` 에 절차를 추가. 휴대폰 카드에서 잘리는 쪽이 비면 apps.yml 에 `thumb_pos: left top`.

## 그 밖에

- 카테고리: learn(배우기) · make(만들기) · play(놀기) · lab(실험실). 새 카테고리는 `_config.yml` 의 `app_categories` + `assets/css/site.css` 에 `--<id>` · `--<id>-soft` 색 변수(라이트 `:root` 와 다크 `:root[data-theme="dark"]` 둘 다). id 를 바꾸면 `legacy:` 에 옛 id 를 남긴다.
- 그림 작품: `webapps/drawing/img/*.md` (`layout: artwork`). 원본 PNG 는 매우 크므로 페이지에는 `figure: …_web.webp`, 공유 미리보기는 `image: …_og.jpg`.
- 글: `_posts/YYYY-MM-DD-제목.md` + `category:`. 앱을 다룬 글이면 `apps: [slug]` (앱 카드에 '만든 이야기' 링크가 붙는다).
- 옛 주소 처리는 `404.html` → `_includes/resolver.html` (+ `_data/redirects.yml`). 기존 공개 주소를 옮길 땐 여기에 옛 주소를 남긴다. (일부러 내린 콘텐츠는 404 로 둔다.)
- 스타일은 `assets/css/site.css` (순수 CSS, Sass 없음). 색은 `:root` 변수로, 다크 모드는 `:root[data-theme="dark"]` 한 곳에만 (head 인라인 스크립트가 data-theme 를 정함).
- Liquid 는 Jekyll 3.10(Liquid 4) 문법만 쓴다. 주석 안의 `{% include %}` 도 실행되니 지운 include 를 남기지 않는다.
- 점검: push 하면 GitHub Actions(`.github/workflows/site-check.yml`)가 `tools/check/check.js` 로 모든 페이지를 연다. 일부러 넘어갈 항목은 `tools/check/allow.js` 에 이유와 함께.
- 할 일 · 새 프로젝트 메모는 `TODO.md` (블로그 빌드에서 제외).

## 사실 · 근거 표기 (콘텐츠를 쓰거나 사실 확인할 때)

- 수치 · 연구 결과 · 의학/경제/과학 주장처럼 근거가 필요한 문장에는, 믿을 만한 근거를 찾았으면 **원본 출처를 단다.**
  - 표시: 문장 끝에 위첨자 링크 `<sup><a href="#ref-3">[3]</a></sup>` → 페이지 아래(또는 앱의 레퍼런스 페이지)에
    `<li id="ref-3">저자 (연도). 논문 · 자료 제목. 학술지 · 기관. <a href="원문 주소">링크</a></li>` 처럼 논문명 · 기관명과 원문 위치를 적는다.
    건강관리처럼 레퍼런스 페이지(`webapps/health/references.html`)가 이미 있으면 그 목록의 항목을 가리킨다.
  - 데이터 파일(JSON)의 값은 같은 파일 안 `"source"` 항목(출처 이름 · 주소 · 기준일)으로 남긴다.
  - 시점이 있는 사실(배당률 · 환율 · 브라우저 지원 · API 상태 등)은 '○○년 기준'을 함께 쓴다.
- 근거를 못 찾았거나 연구마다 갈리는 주장은 사실처럼 단정하지 말고 '~라는 연구가 있다', '근거가 엇갈린다' 처럼 쓴다.
- 고칠 때는 문구만 바꾸지 말고 같은 수치가 나오는 다른 곳(사전 · 요약 · 앱 목록 설명 · 계산 결과)도 함께 맞춘다.
- 사실 확인 진행 상황과 남은 범위는 `TODO.md` 의 '사이트 전체 사실 확인' 항목.
