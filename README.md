0. 현제 폴터 주소창에 "cmd" 입력
1. 번들 실행
2. Ruby 3.0 이상에서는 webrick 종속성 빠져서 수동으로 넣어줘야 함.
3. jekyll 로컬 호스트 실행

```cmd
:: 1. 번들 실행
bundle

:: 2. 종속성 빠진 라이브러리 추가
bundle add webrick

:: 3. 로컬 호스트 실행
bundle exec jekyll serve
```


### Gemfile
```gemfile
source "https://rubygems.org"

gem "minimal-mistakes-jekyll"
gem "jekyll-include-cache", group: :jekyll_plugins
gem "github-pages", group: :jekyll_plugins
gem "webrick", "~> 1.7"
```