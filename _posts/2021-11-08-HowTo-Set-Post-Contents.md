---
title : "Example_Jekyll_Blog_Contents"
categories:
  - Memo
tags:
  - HowTo
  - BLOG
---

<details>
<summary>접기/펼치기 버튼 넣기</summary>
<div markdown="1">

```md
<details>
<summary>접기/펼치기 버튼</summary>
<div markdown="1">

|제목|내용|
|--|--|
|1|1|
|2|10|

</div>
</details>
```

|제목|내용|
|--|--|
|1|1|
|2|10|

</div>
</details>
<br>


<details>
<summary>첨부파일 넣기</summary>
<div markdown="1">
```md
some text and [here is possible to download the file in PDF][1]
[1]:{{ site.url }}/download/file.pdf
```
</div>
</details>
<br>


<details>
<summary>이미지 넣기</summary>
<div markdown="1">
```md
<!-- 이미지 가운데 정렬 -->
<figure class="align-center">
  <img src="{{ site.url }}{{ site.baseurl }}/assets/images/image-alignment-580x300.jpg" alt="">
  <figcaption>Look at 580 x 300 getting some love.</figcaption>
</figure> 

<!-- 좌우정렬 및 너비 설정  -->
<figure style="width: 150px" class="align-left">
<figure style="width: 300px" class="align-right">

<!-- 상대경로로 호출 -->
<img src="./assets/daynightshift.gif" style="width:50%" />
```
</div>
</details>
<br>


<details>
<summary>하이퍼링크 넣기</summary>
<div markdown="1">

```md
글자 사이에 자연스럽게[Jekyll's GitHub repo][jekyll-gh] 링크 배치하기

[jekyll-gh]:   https://github.com/jekyll/jekyll
```
</div>
</details>
<br>


<details>
<summary> YouTube 넣는 법 </summary>
<div markdown="1">

```ruby
# 문법을 제대로 쓰면 자동으로 내용이 Replace 되어 {} 와 % 사이에 공백을 추가했다.
# 실제로 사용할 때는 아래 명령어 양끝에 {} 와 % 사이에 공백을 제거해야한다.
{ % include video id="MoaUw6Vguy4" provider="youtube" % }
{ % include video id="MoaUw6Vguy4?start=10" provider="youtube" % }
```
</div>
</details>
{% include video id="MoaUw6Vguy4?start=10 " provider="youtube" %}

<br>
<details>
<summary> Reference</summary>
<div markdown="1">

- [참고문서-jekyll-1](https://ehfgk78.github.io/2017/12/27/jekyll-detail/)
- [참고문서-jekyll-2](https://pengpengto.gitlab.io/blog/tech/2017/06/29/jekyll-excerpt_option.html)
- [Jekyll 카테고리](https://ansohxxn.github.io/blog/category/)
- [Jekyll 파일구조](https://ansohxxn.github.io/blog/jekyll-directory-structure/)  
- [반복문 써서 내용 구성](https://github.com/mushishi78/jekyll-group-by-array)  
- [다개국어 블로그 만들기](https://forestry.io/blog/creating-a-multilingual-blog-with-jekyll/)

</div>
</details>