## 실시간 전국 날씨와 기온차 차트 개발 
담당자 : 박원빈(리더), 김은지

### 학습목표
- HTML5, CSS3, JavaScript를 이용해 웹 서비스 홈페이지 제작 
- Chast.js 및 Jquery 개발에 활용 
- JavaScript를 사용해 외부 플러그인화 
***

### 학습내용
1. #### STEP1 
    JavaScript Array 함수로 [맑음, 흐림, 비, 눈, 바람] 생성 후 각 index 별 다른 값을 지정하여 0.5~2초마다 랜덤 값을 부여하도록 코딩
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
```
2. #### STEP2 
    [Chart.js](https://www.chartjs.org/) 플로그인을 활용하여 도출된 1번 값을 차트 표에 반환하도록 코딩 
```js
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
3. #### STEP3 
    완성된 결과물 

![Honeycam 2024-02-01 11-55-56](https://github.com/ParkWonBin/Codelabit_AICC_Project_01/assets/153577632/6542c7db-e30b-4b5b-8644-4bde684c914d)
