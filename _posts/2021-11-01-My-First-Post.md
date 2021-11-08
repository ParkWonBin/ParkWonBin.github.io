---
title : "Jekyll_Blog_First_Post"
categories:
  - Memo
tags:
  - BLOG
---

# Start GitHub WebLog
로컬로 Blog를 호스팅하면 레포지토리 내 md파일이 _site 폴더에 내용이 구워집니다.

##### ToDo List
- [x] 게시글 생성
- [ ] 카테고리 생성
- [ ] 카테고리 aside에 배치
- [ ] 필요에 따라 aside 내용 변경 방법 찾기
- [ ] 한 페이지 안에서 카테고리 or 테그 모두 보기 (README처럼 사용하기 위함, code block 검색 확인용)
- [ ] 코드블록이나 이미지 등, 병렬적으로 배치하는 방법 찾기 (다른 post를 글 내용에 그대로 불러오는 방법 찾기)
- [ ] 댓글 등록 기능 찾기
- [ ] CSS나 글꼴 변경 찾기
- [ ] JS 등으로 인터랙티브 구현하는 방법도 찾아두기

#### Run Blog in Local
윈도우 탐색기로 repository 경로까지 진입 후 주소창에 "cmd" 입력
Ruby 3.0 이상에서는 webrick 종속성 빠져서 수동으로 넣어줘야 함.

```cmd
:: 1. 번들 실행
bundle
:: 2. 라이브러리 추가 
bundle add webrick
:: 3. 로컬 호스트 실행
bundle exec jekyll serve
```

#### Set Gemfile
```gemfile
source "https://rubygems.org"
gem "minimal-mistakes-jekyll"
gem "jekyll-include-cache", group: :jekyll_plugins
gem "github-pages", group: :jekyll_plugins
gem "webrick", "~> 1.7"
```
