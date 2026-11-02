# ParkWonBin.github.io

Jekyll 기반 개인 블로그 + 정적 웹앱 모음 — <https://wbpark.app>

GitHub Pages 기본 빌드(별도 Actions 없음)로 `jekyll-blog` 브랜치에서 배포됩니다.

---

## 한눈에 보는 구조

```
_config.yml            사이트 설정 · 상단 메뉴 · 웹앱 카테고리 · 푸터 링크
_data/
  apps.yml             ★ 웹앱 목록 (홈 카드 + 단축 주소가 전부 여기서 나옴)
  drawing.yml          그림 페이지 문구
  redirects.yml        앱이 아닌 옛 주소 → 새 주소
_layouts/              default · page · post · artwork · redirect
_includes/             head · header · footer · app-card · art-card · post-item · resolver
_posts/                글 (YYYY-MM-DD-제목.md) — 첫 글을 쓸 때 폴더를 만들면 됩니다
pages/                 그림(/drawing/) · 글 목록(/posts/) · About(/about/)
index.html             홈 = 웹앱 목록 (검색 · 카테고리 필터)
404.html               없는 주소 안내 + 단축 주소 / 옛 주소 처리
assets/
  css/site.css         사이트 스타일 (순수 CSS, 라이트/다크 — 시스템 설정 + 헤더 토글)
  js/site.js           라이트/다크 토글, 목록 검색 · 필터
  js/analytics.js      Google Analytics (블로그 + 모든 웹앱 공용)
webapps/<slug>/        웹앱 하나 = 폴더 하나 (index.html 이 곧 앱)
webapps/drawing/img/   전시 작품 페이지(*.md) 와 이미지
```

---

## 새 웹앱 추가 (2단계)

### 1. `webapps/<slug>/index.html` 넣기

- 앱 자체를 그대로 넣습니다. **front matter(`---`) 없이** 순수 HTML 이면 Jekyll 이 손대지 않고 그대로 배포합니다.
  (그래서 JS 안의 `{{ }}` 때문에 `{% raw %}` 를 쓸 필요도 없습니다.)
- CSS · JS · 데이터 파일은 같은 폴더에 두고 상대 경로(`./app.js`)로 부르면 됩니다.
- 방문 통계를 남기려면 앱의 각 HTML 페이지 `<head>` 안에 한 줄 추가:

  ```html
  <script src="/assets/js/analytics.js" defer></script>
  ```

> `app.html`(전체화면용 복사본)이나 블로그 틀로 감싼 미리보기 페이지는 **더 이상 만들지 않습니다.**
> 카드를 누르면 앱이 바로 전체 화면으로 열립니다.

### 2. `_data/apps.yml` 에 항목 하나 추가

```yaml
- slug: my_app                 # webapps/ 아래 폴더 이름 → /webapps/my_app/
  title: 내 앱
  category: art                # info | tech | art | game | test
  icon: 🧪                     # (선택) 카드 아이콘 이모지
  desc: 한두 문장 설명. HTML 없이 줄글로.
  tags: [Canvas, WebGL]        # (선택) 기술 · 키워드 — 검색에도 쓰임
  date: 2026-11-02             # (선택) 추가한 날. 30일 동안 NEW 표시
  alias: [myapp]               # (선택) 단축 주소 → wbpark.app/myapp
```

그 밖의 선택 항목:

| 항목 | 설명 |
|---|---|
| `url` | 다른 곳에 있는 앱이면 그 주소 (slug 대신 이 주소로 연결) |
| `repo` | 소스 링크. 생략하면 이 저장소의 `webapps/<slug>/` 로 자동 연결 |
| `hidden: true` | 목록에서만 숨김. 앱 주소 · 단축 주소는 그대로 동작 |

같은 카테고리 안에서는 파일에 적힌 순서대로 보입니다. 카테고리(정보 · 기술 도구 · 예술 도구 · 게임 · 테스트)의 이름 · 순서는 `_config.yml` 의 `app_categories` 에서 바꾸고, 카드 색은 `assets/css/site.css` 의 `--<카테고리>` · `--<카테고리>-soft` 변수(라이트 · 다크 블록 둘 다)입니다. 새 카테고리는 이 두 곳만 추가하면 됩니다.

**끝.** 리다이렉트 파일, 카테고리별 include, 홈 화면 수정은 필요 없습니다.

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
image: /webapps/drawing/img/006_Name_web.webp         # 페이지에 보일 이미지 (긴 변 2000px 정도)
original: /webapps/drawing/img/006_Name.png           # (선택) '원본 크기로 보기' 링크
---

작품 이야기…
```

그림 목록(`/drawing/`), 홈 화면, 이전/다음 작품 링크는 자동으로 만들어집니다.
원본 PNG 는 수십 MB 라 페이지에는 웹용 이미지(`_web.webp`)를 씁니다. 만드는 법(Pillow):

```sh
python -c "from PIL import Image; im=Image.open('006_Name.png').convert('RGB'); im.thumbnail((2000,2000)); im.save('006_Name_web.webp', quality=82, method=6)"
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
| `/webapps/drawing/` (전시회 QR) 과 그 아래 깨진 주소 | 그림 페이지(작품 목록 + 3D 전시관 입구) / 움직임 작품 |

---

## 로컬 실행

`serve.bat` 실행, 또는

```sh
bundle exec jekyll serve --livereload
# http://127.0.0.1:4000
```

bundle 이 없으면 `gem install bundler jekyll` (Ruby: <https://rubyinstaller.org/downloads/>).

실제 배포 환경(GitHub Pages, Jekyll 3.10)과 똑같이 확인하려면 `github-pages` gem 으로 빌드하면 됩니다.
로컬에서는 `wbpark.app` 이 아니므로 방문 통계는 쌓이지 않습니다.
