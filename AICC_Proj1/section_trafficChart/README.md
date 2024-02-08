## 실시간 지하철 혼잡도 차트 개발
- [x] chart 플러그인 다운로드
  [chart.js](https://www.chartjs.org/docs/latest/samples/line/line.html) 참조
- [x] step1 호선별 차트 그리기 (예시코드)
  ```js
  '''
  function InitTrafficChart() {
    const ctx = document.getElementById('percentageChart').getContext('2d');
    percentageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 10}, (_, i) => ''),
            datasets: [
                {
                    label: '1호선 혼잡율',
                    borderColor: 'rgb(0,82,164)',
                    borderWidth: 4,
                    fill: false,
                    data: chart_percentageChanges[0]
                }
  '''
  ```
- [x] step2 호선별 그래프 그리기 (예시코드)
  
  ```js  

    function CreateTrafficChart() {
    let trafficContainer = $('#trafficChart')
    let table = $('<table></table>')
    table.append(`<tr><th></th><th>1호선</th><th>2호선</th><th>3호선</th><th>4호선</th><th>5호선</th><th>6호선</th><th>7호선</th><th>8호선</th><th>9호선</th></tr>`)

    let tableSecondRow = $(`<tr id="percentageChangeRow"></tr>`)
    tableSecondRow.append($(`<th> 혼잡도(%)</th>`))
    tableSecondRow.append($(`<td class="percentageChange">80%</td>`))
    tableSecondRow.append($(`<td class="percentageChange">90%</td>`))
    tableSecondRow.append($(`<td class="percentageChange">70%</td>`))
    tableSecondRow.append($(`<td class="percentageChange">65%</td>`))
    tableSecondRow.append($(`<td class="percentageChange">50%</td>`))
    tableSecondRow.append($(`<td class="percentageChange">60%</td>`))
    tableSecondRow.append($(`<td class="percentageChange">75%</td>`))
    tableSecondRow.append($(`<td class="percentageChange">66%</td>`))
    tableSecondRow.append($(`<td class="percentageChange">70%</td>`))
    table.append(tableSecondRow)
    trafficContainer.append(table);
    trafficContainer.append($(`<canvas height="140" id="percentageChart"></canvas>`));}

- [x] step3 동적으로 그래프 변화 기능 추가(예시코드)

```js

function flow_rate() {
    const percentageChangeElements = document.querySelectorAll('.percentageChange');

    percentageChangeElements.forEach(function (td, index) {
        const currentPercentage = parseFloat(td.textContent.replace('%', ''));
        const randomChangePercentage = (Math.random() - 0.5) * 10;
        let newPercentage = currentPercentage + randomChangePercentage;

        if (newPercentage > 100 ){
            newPercentage = newPercentage - 5
        }

        if (newPercentage < 50){
            newPercentage = newPercentage + 5
        }

        td.textContent = newPercentage.toFixed(2) + '%';

        chart_percentageChanges[index].push(newPercentage);

        if (chart_percentageChanges[index].length > 10) {
            chart_percentageChanges[index].shift();
        }
    });

    updateChart();
}



 


