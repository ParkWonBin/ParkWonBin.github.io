# 윈도우에서 jekyll 설치하는법 

## 주의사항
- [공식 문서 참고](https://jekyllrb-ko.github.io/docs/installation/windows/)
- [좋은 설명 참고](https://blog.hyeyoonjung.com/2017/05/04/how-to-start-jekyll/)

1. ruby 버전 : 2.7 버전 (2.4 이상)
- 버전오류 : 3.0 이상에서는 종속성 오류 있음.
- 다운로드 : https://rubyinstaller.org/downloads/archives/
- 상위버전으로 해결하고자 한다면 아래 명령어 수행할 것
  -  bundle install
  -  bundle add webrick

1. 환경변수 설정
- 인스톨러에서 설치할 때 자세히 보고 PATH 다 체크해놓기

1. ridk install
- 인스톨러로 설치하고나면 마지막에 ridk 설치여부 체크박스 나옴.

## 시작하기
### 개발 환경 설치
cmd 열고 명령어 수행 (위치 상관 없음)
```bash 
ruby -v 
# ruby 2.7.5p203 (2021-11-24 revision f69aeb8314) [i386-mingw32]

gem -v
# 3.1.6

gem install jekyll bundler
# 한참 기다리면 설치되는 라이브러리 목록 뜸.

# 에러나면 에러문구 보고 특정 버전들 다운로드 받아주기
gem install sass-embedded -v 1.63.6
```


## 깃허브 페이지 레포지토리 진입
해당 레포지토리에서 cmd 열고 명령어 수행

### jekyll 설치
```bash
# 현재 경로(./)에 강제로 설치. (폴더 비어있으면 --force 안해도 설치됨)
jekyll new ./ --force

```

### jekyll 실행
```bash
bundle -v
# Bundler version 2.1.4

# 실행
bundle exec jekyll serve
# 4000번 포트 들어가보면 돌고있음.
# http://localhost:4000
```

----
plugin 관리

_config.yml
```yml
plugins:
  - jekyll-sitemap
  - jekyll-paginate

```
Gemfile
```gemfile
gem "jekyll", "~> 4.3.3"
gem "minima", "~> 2.5"
gem 'jekyll-sitemap'
gem 'jekyll-paginate'
```
