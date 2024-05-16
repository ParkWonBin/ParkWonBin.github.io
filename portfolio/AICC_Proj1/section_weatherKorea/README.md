# 전국 날씨
##### 바쁜 현대인의 아침 출근길 시간대별 상세 날씨 정보와 일주일의 날씨에 대한 정보를 제공하는 것이 목표.
---

## 요일별 전국 날씨 지도
![전국 날씨 지도](src/전국날씨지도.png)

#### 목표
- 요일별로 전국 날씨 현황을 확인할 수 있다.  
- 오전/오후로 나눠 시간대별 전국 날씨 현황을 확인할 수 있다.
   
```js
var weather_DAY = '월'
var weather_time = '오전'

function weather_DaySelected(selectedDay,dateName){
    document.querySelectorAll('#weatherTitle > button').forEach(button => {
        button.classList.remove('active');
    });
    // 선택된 요일 버튼에 active 클래스 추가
    $(`#${selectedDay}`).addClass('active');

    weather_DAY = dateName;
    weather_setImageSrc(weather_DAY,weather_time)
}

function weather_TimeSelected(timeName){
    weather_time = timeName
    weather_setImageSrc(weather_DAY,weather_time)
}
function weather_setImageSrc(day,time){
    // day : 월화수목금토일
    // time : 오전,오후
    $('#weather_koreaImg').attr('src',`src/전국날씨_${day}_${time}.jpg`)
}

// $("#weather_Mon").on('click',function(){
//     weather_DaySelected('weather_Mon','월')
// })
function CreateweatherKorea(){
    let weatherContainer =  $('#weatherKorea')
    let weather_wrap = $('<div id="weather_wrap"></div>')

    let weatherTitle = $('<div id="weatherTitle"></div>')
    let weatherImgContainer = $('<div id="weather_ImgContainer"></div>')

    weatherContainer.append(weather_wrap)
    weather_wrap.append(weatherTitle)
    weather_wrap.append(weatherImgContainer)

    weatherTitle.append($(`<button id="weather_Mon" class="active" onclick="weather_DaySelected('weather_Mon','월')"> 월 </button>`))
    weatherTitle.append($(`<button id="weather_Tue" onclick="weather_DaySelected('weather_Tue','화')"> 화 </button>`))
    weatherTitle.append($(`<button id="weather_Wed" onclick="weather_DaySelected('weather_Wed','수')"> 수 </button>`))
    weatherTitle.append($(`<button id="weather_Thu" onclick="weather_DaySelected('weather_Thu','목')"> 목 </button>`))
    weatherTitle.append($(`<button id="weather_Fri" onclick="weather_DaySelected('weather_Fri','금')"> 금 </button>`))
    weatherTitle.append($(`<button id="weather_Sat" onclick="weather_DaySelected('weather_Sat','토')"> 토 </button>`))
    weatherTitle.append($(`<button id="weather_Sun" onclick="weather_DaySelected('weather_Sun','일')"> 일 </button>`))

    weatherImgContainer.append($(`<button id="weather_AM" onclick="weather_TimeSelected('오전')">오전</button>`))
    weatherImgContainer.append($(`<button id="weather_PM" onclick="weather_TimeSelected('오후')">오후</button><br>`))
    weatherImgContainer.append($(`<img id="weather_koreaImg" src="src/전국날씨_월_오전.jpg" >`))

}

$(CreateweatherKorea)
```
  
#### 코드설명  
###### 요일 & 오전/오후의 버튼클릭으로 이미지 변경이 가능.
---

## 오늘의 날씨 정보
![오늘의 날씨](src/오늘의날씨.png)

#### 목표
- 오늘의 날씨 정보를 뉴스 영상으로 시청이 가능하다.
  
##### 코드 공간  
---

## 요일별 기온 정보 트래픽
![Honeycam 2024-02-01 11-55-56](https://github.com/ParkWonBin/Codelabit_AICC_Project_01/assets/153577632/6542c7db-e30b-4b5b-8644-4bde684c914d)

#### 목표
- 요일별, 날씨 주간 기온차를 그래프로 통해 한눈에 확인이 가능하다.
  
```js
let weaterChartData = [];
let tempChart;

const MIN_INTERVAL = 500;
const MAX_INTERVAL = 2000;

const weatherChartData = {
    '맑음': [8, 10, 'src/brightness.png'],
    '흐림': [5, 7, 'src/sun.png'],
    '비': [3, 6, "src/rain.png"],
    '눈': [-3, 5, "src/snow.png"],
    '바람': [4, 5, "src/wind.png"]
}
// 범위 내 랜덤 숫자 뽑기
function getRandomInterval(min, max) {
    return Math.random() * (max - min) + min;
}
// 임의의 날짜 뽑기
function getRandomWeather() { //
    const keys = Object.keys(weatherChartData)
    return weatherChartData[keys[Math.floor(getRandomInterval(0, keys.length))]]
}
function weeklyUpdate() {
    const randomInterval = getRandomInterval(MIN_INTERVAL, MAX_INTERVAL)
    setTimeout(function () {
        updateTempByRendom();
        weeklyUpdate();
    }, randomInterval);
}
function updateTempByRendom() {
    weaterChartData = []
    for (let i = 1; i < 8; i++) {
        const [minTemp, maxTemp, ImgSrc] = getRandomWeather();

        let randTemp = getRandomInterval(minTemp, maxTemp).toFixed(1);
        weaterChartData.push(randTemp);

        // 이미지 잡기
        $(`#wcTitle > div:nth-child(${i}) > img`).attr('src', ImgSrc)

        // 기온 잡기
        $(`#wcTitle > div:nth-child(${i}) > div.wcTemp`).text(randTemp)

    }
    tempChart.data.datasets[0].data = weaterChartData;
    tempChart.update();
}
```

#### 코드설명
###### 랜덤한 값으로 요일별 기온차를 확인할 수 있다.  
---

# 작업일지

### 날씨정보 섹션
날씨정보 관련된 이미지를 등록하는 위치입니다.  
이미지 작업이 끝난 후에는, common > src 경로에도 파일을 복사해주세요.

## 기능 명세
### 전국날씨 요일별 오전 오후 날씨
- [x] 이미지 리소스 확보 (1/12)  - 김인수
- [x] 전국날씨 UI 초안 작성 (1/12) - 김인수
- [ ] 이미지 리소스 변경 함수 개발 (1/15) - 박원빈
- [ ] 요일별 오전 오후 버튼에 이미지 변경 이벤트 등록 (1/15) - 김인수
- [ ] 버튼 위치 및 CSS 적당히 편집 (1/15)
- [ ] ...필요 시 날씨 영역 추가 기획
- [ ] ...(시간 남으면) HTML 구조 전체를 JS/JQuery 로 생성하도록 고도화

### 메인 레이아웃
- [x] 목업 페이지 초안 작성 (1/12) - 김은지
- [x] 로고 및 네비게이션 메뉴 추가 (1/12) - 김은지
- [x] 공통 CSS 초안 작성 (1/12) - 김은지
- [ ] index 디자인 구체화 CSS/JS (1/15) - 김은지
- [ ] ... 필요 시 index 영역 추가 기획


### 기타 (미확정 사항)
- [ ] BGM on/off
- [ ] 외부 링크 열기(JS/JQuery로 HTML생성)
- [ ] 랜덤 날씨 동영상(유튜브) 끌어와서 틀기
