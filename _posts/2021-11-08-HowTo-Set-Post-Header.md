---
title : "Example_Jekyll_Blog_Placeholders"
categories:
  - Memo
tags:
  - HowTo
  - BLOG
---

```yaml
title : "게시글 제목을 설정합니다."
excerpt: "GitHub github.io "
  # 게시글 목록에서 요약글 형태로 보입니다. 
categories:
  - 카테고리 여러개 선택 가능
  - 카테고리1
  - 카테고리2
tags:
  - 테그1
  - 테그2
permalink: /docs/example/
  # permalik는 URL을 직접 설정합니다. 
  # 한/영 페이지나, Docs 등 만들 떄 사용하기 편합니다.
last_modified_at: 2018-03-20T16:00:34-04:00
  # 최근 수정 시간 설정
date: 2016-02-24T03:02:20+00:00
  # 게시글 작성일시
toc: true
  # Table Of Contents 
  # 오르쪽 사이즈 바에 표시해주는 기능
toc_sticky: true
  # skicy 설정
layout: post
  # 레이아웃
author_profile: False
  # 왼쪽 프로필 끄기
collection: recipes
  # 해당 글만 모으는 것 같은데 정확히는 모름
```
[permalink 설명](https://jekyllrb-ko.github.io/docs/permalinks/)
[TOC 사용법](https://devinlife.com/howto%20github%20pages/toc-table/)

```yaml
# 테그목록은 다음과 같은 느낌으로 전체 표시 가능
permalink: /tags/markup/
taxonomy: markup
```
