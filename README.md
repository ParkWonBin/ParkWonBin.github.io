# ParkWonBin.github.io

Jekyll 기반 개인 블로그 + 정적 웹앱 모음 — <https://wbpark.app>

GitHub Pages 기본 빌드로 `jekyll-blog` 브랜치에서 배포됩니다.
push 할 때마다 GitHub Actions 의 **사이트 점검**(`.github/workflows/site-check.yml`)이 모든 페이지를 열어 봅니다 (배포와는 별개).

---

## 한눈에 보는 구조

```
_config.yml            사이트 설정 · 상단 메뉴 · 웹앱 카테고리 · 푸터 링크
_data/
  apps.yml             ★ 웹앱 목록 (홈 카드 · 대표작 · 단축 주소가 전부 여기서 나옴)
  drawing.yml          그림 페이지 문구
  redirects.yml        앱이 아닌 옛 주소 → 새 주소
_layouts/              default · page · post · artwork · redirect
_includes/             head · header · footer · app-card · feature-tile · art-card · post-item · share-dialog · resolver
_posts/                글 (YYYY-MM-DD-제목.md) — 첫 글을 쓸 때 폴더를 만들면 됩니다
pages/                 그림(/drawing/) · 글 목록(/posts/) · About(/about/)
index.html             홈 = 대표작 + 웹앱 목록 (검색 · 카테고리 · 태그 모아 보기 · 공유)
404.html               없는 주소 안내 + 단축 주소 / 옛 주소 처리
apps.json              앱 목록 JSON (도구들이 읽음, 직접 고칠 필요 없음)
assets/
  css/site.css         사이트 스타일 (순수 CSS, 라이트/다크 — 시스템 설정 + 헤더 토글)
  js/site.js           라이트/다크 토글, 목록 검색 · 필터 · 태그, 공유 창
  js/analytics.js      Google Analytics (블로그 + 모든 웹앱 공용)
  js/app-bar.js        웹앱 화면의 '← wbpark' 블로그로 돌아가기 표시
  js/lib/qrcode.min.js  공유 창의 QR 코드 (필요할 때만 불러옴)
  thumbs/<slug>.webp   웹앱 카드 썸네일 (tools/thumbs.js 로 생성)
webapps/<slug>/        웹앱 하나 = 폴더 하나 (index.html 이 곧 앱)
webapps/drawing/img/   전시 작품 페이지(*.md) 와 이미지
tools/                 썸네일 만들기 · 사이트 점검 (블로그에는 올라가지 않음)
TODO.md                할 일 · 새 프로젝트 메모 (블로그에는 올라가지 않음)
```

---

## 새 웹앱 추가

### 1. `webapps/<slug>/index.html` 넣기

- 앱 자체를 그대로 넣습니다. **front matter(`---`) 없이** 순수 HTML 이면 Jekyll 이 손대지 않고 그대로 배포합니다.
  (그래서 JS 안의 `{{ }}` 때문에 `{% raw %}` 를 쓸 필요도 없습니다.)
- CSS · JS · 데이터 파일은 같은 폴더에 두고 상대 경로(`./app.js`)로 부르면 됩니다.
- 앱의 각 HTML 페이지 `<head>` 안에 두 줄을 넣습니다:

  ```html
  <script src="/assets/js/analytics.js" defer></script>
  <script src="/assets/js/app-bar.js" defer data-pos="bl"></script>
  ```

  - 첫 줄: 방문 통계
  - 둘째 줄: 화면 구석의 '← wbpark' 블로그로 돌아가기 표시. 앱 버튼과 겹치면 `data-pos` 를 `br`(오른쪽 아래) · `tl` · `tr` 로,
    휴대폰에서만 다른 구석이 좋으면 `data-pos-m="tr"` 처럼 따로 줍니다. 앱에 이미 블로그 링크가 있으면 빼도 됩니다.

> `app.html`(전체화면용 복사본)이나 블로그 틀로 감싼 미리보기 페이지는 **더 이상 만들지 않습니다.**
> 카드를 누르면 앱이 바로 전체 화면으로 열립니다.

### 2. `_data/apps.yml` 에 항목 하나 추가

```yaml
- slug: my_app                 # webapps/ 아래 폴더 이름 → /webapps/my_app/
  title: 내 앱
  category: make               # learn(배우기) | make(만들기) | play(놀기) | lab(실험실)
  icon: 🧪                     # (선택) 썸네일이 없을 때 쓰는 아이콘 이모지
  desc: 한두 문장 설명. HTML 없이 줄글로.
  tags: [Canvas, WebGL]        # (선택) 기술 · 키워드 — 카드에서 누르면 같은 태그끼리 모아 보기
  usage:                       # (선택) 사용법 2~4줄 — 카드의 '사용법'을 펼치면 보임
    - "‘시작’을 누르면 …해요"
  date: 2026-11-02             # (선택) 추가한 날. 30일 동안 NEW 표시
  alias: [myapp]               # (선택) 단축 주소 → wbpark.app/myapp
```

그 밖의 선택 항목:

| 항목 | 설명 |
|---|---|
| `series` | 시리즈 이름 (예: `워해머`). 카드에 '🔗 워해머 시리즈' 가 붙고, 누르면 같은 시리즈끼리 모아 봄 |
| `featured: true` | 홈 맨 위 '⭐ 대표작' 줄에도 나옴 (3~4개 권장) |
| `updated` | 기능을 크게 바꾼 날짜. 30일 동안 '업데이트' 표시 |
| `thumbnail` | 카드 이미지를 직접 지정. 생략하면 `assets/thumbs/<slug>.webp` 가 있으면 그것, 없으면 아이콘 |
| `url` | 다른 곳에 있는 앱이면 그 주소 (slug 대신 이 주소로 연결) |
| `repo` | 소스 링크. 생략하면 이 저장소의 `webapps/<slug>/` 로 자동 연결 |
| `hidden: true` | 목록에서만 숨김. 앱 주소 · 단축 주소는 그대로 동작 |

- `usage` · 설명에 `예: ‘이름’` 처럼 콜론(`: `)이 들어가면 줄 전체를 따옴표로 감쌉니다.
- 같은 카테고리 안에서는 파일에 적힌 순서대로 보입니다.
- 카테고리의 이름 · 설명 · 순서는 `_config.yml` 의 `app_categories`, 카드 색은 `assets/css/site.css` 의 `--<id>` · `--<id>-soft`
  (라이트 `:root` 와 다크 `:root[data-theme="dark"]` 둘 다). 새 카테고리는 이 두 곳만 추가하면 됩니다.
  카테고리 id 를 바꿀 때는 `legacy: [옛 id]` 를 남겨 두면 예전 `wbpark.app/#옛id` 링크가 새 분류로 열립니다.
- 카드의 **공유** 버튼은 단축 주소(없으면 앱 주소)를 복사하거나 QR 로 보여 줍니다. 따로 할 일은 없습니다.

### 3. (선택) 썸네일 만들기

```sh
bundle exec jekyll serve              # 사이트를 띄워 두고
node tools/thumbs.js --only my_app    # assets/thumbs/my_app.webp 생성 (Playwright 필요)
```

첫 화면이 비어 있는 앱은 `tools/thumbs.hooks.js` 에 '찍기 전에 누를 것'을 적어 두면 됩니다 (예: 시작 버튼, 예시 이미지 올리기).
공유 미리보기 이미지(카카오톡 등)는 `node tools/thumbs.js --og` 로 다시 만듭니다 → `assets/images/og-default.jpg`.

---

## 그림 추가

`webapps/drawing/img/` 에 이미지와 `.md` 파일을 넣습니다.

```markdown
---
layout: artwork
title: "작품 제목"
subtitle: "한 줄 소개"
order: 6                                              # 목록 순서
thumbnail: /webapps/drawing/img/006_Name_thm.png      # 목록용 작은 이미지
figure: /webapps/drawing/img/006_Name_web.webp        # 페이지에 보일 이미지 (긴 변 2000px 정도)
image: /webapps/drawing/img/006_Name_og.jpg           # 공유 미리보기 (긴 변 1200px JPG)
original: /webapps/drawing/img/006_Name.png           # (선택) '원본 크기로 보기' 링크
---

작품 이야기…
```

그림 목록(`/drawing/`), 홈 화면, 이전/다음 작품 링크는 자동으로 만들어집니다.
원본 PNG 는 수십 MB 라 페이지에는 웹용 이미지를 씁니다. 만드는 법(Pillow):

```sh
python -c "from PIL import Image; im=Image.open('006_Name.png').convert('RGB'); im.thumbnail((2000,2000)); im.save('006_Name_web.webp', quality=82, method=6); im.thumbnail((1200,1200)); im.save('006_Name_og.jpg', quality=82)"
```

---

## 글 쓰기

`_posts/2026-11-02-제목.md`:

```markdown
---
title: 글 제목
category: network          # 글 목록에서 카테고리 필터로 묶임
tags: [TCP, OSI]           # (선택)
description: 한 줄 요약     # (선택) 목록에 보임
apps: [warhammer_map]      # (선택) 이 글에서 다룬 앱 → 글 끝에 앱 카드, 그 앱 카드에는 '만든 이야기' 링크
---

본문…
```

- 주소는 `/posts/제목/` 이 됩니다.
- 파일 정리용으로 `_posts/network/…` 처럼 하위 폴더를 만들어도 됩니다 (분류는 `category` 로).
- 글이 하나라도 생기면 상단 메뉴에 **글** 이 나타나고, 홈에 최근 글이 표시됩니다.

---

## 단축 주소 · 옛 주소

GitHub Pages 는 없는 주소에 `404.html` 을 보여주는데, 그 `<head>` 의 스크립트(`_includes/resolver.html`)가 화면을 그리기 전에 새 주소로 보냅니다.

| 들어온 주소 | 이동 |
|---|---|
| `/finance` 같은 단축 주소 (대소문자 무시, `/finance/index.html` · `/finance.html` 도) | `apps.yml` 의 `alias` 에 적힌 앱 |
| `/webapps/<앱>/app.html?…#…` (예전 전체화면 · 공유 링크) | `/webapps/<앱>/?…#…` (쿼리 · 해시 유지) |
| `_data/redirects.yml` 에 적힌 옛 주소 | 적힌 새 주소 |
| `/webapps/drawing/` (전시회 QR) 과 그 아래 깨진 주소 | 그림 페이지(작품 목록) / 움직임 작품 |

홈의 분류 · 태그도 주소로 공유됩니다: `wbpark.app/#make` (만들기만), `wbpark.app/?tag=three.js` (Three.js 태그끼리).

---

## 사이트 점검

push 할 때마다 GitHub Actions 가 GitHub Pages 와 같은 `github-pages` gem 으로 빌드한 뒤,
`tools/check/check.js` 로 모든 페이지를 실제 브라우저(Chromium)로 열어 봅니다.

- **실패로 치는 것**: 깨진 이미지, 사이트 안의 404, 페이지 JS 오류, 끝까지 스크롤해도 투명한 채인 긴 본문, 단축 · 옛 주소가 제 위치로 안 감
- **경고만**: 외부(CDN · 지도 타일 등) 요청 실패, 90초 안에 끝까지 못 본 페이지(시간 초과 — 점검이 멈추지 않게 다음으로 넘어감)
- 결과 표는 Actions 실행 화면의 Summary 에 나옵니다. 일부러 넘어갈 항목은 `tools/check/allow.js` 에 이유와 함께 적습니다.

로컬에서 돌리기:

```sh
BUNDLE_GEMFILE=tools/check/Gemfile bundle install
BUNDLE_GEMFILE=tools/check/Gemfile bundle exec jekyll build
cd tools/check && npm ci && npx playwright install chromium && cd ../..
node tools/check/check.js _site
```

---

## 로컬 실행

`serve.bat` 실행, 또는

```sh
bundle exec jekyll serve --livereload
# http://127.0.0.1:4000
```

bundle 이 없으면 `gem install bundler jekyll` (Ruby: <https://rubyinstaller.org/downloads/>).

실제 배포 환경(GitHub Pages, Jekyll 3.10)과 똑같이 확인하려면 위 '사이트 점검'의 `tools/check/Gemfile` 로 빌드합니다.
로컬에서는 `wbpark.app` 이 아니므로 방문 통계는 쌓이지 않습니다.
