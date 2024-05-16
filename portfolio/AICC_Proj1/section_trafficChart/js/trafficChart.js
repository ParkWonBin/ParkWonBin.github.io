const chart_percentageChanges = [[], [], [], [], [], [], [], [], [], []];
let percentageChart;


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
                },
                {
                    label: '2호선 혼잡율',
                    borderColor: 'rgb(0,168,77)',
                    borderWidth: 4,
                    fill: false,
                    data: chart_percentageChanges[1]
                },
                {
                    label: '3호선 혼잡율',
                    borderColor: 'rgb(239,124,28)',
                    borderWidth: 4,
                    fill: false,
                    data: chart_percentageChanges[2]
                },
                {
                    label: '4호선 혼잡율',
                    borderColor: 'rgb(0,164,227)',
                    borderWidth: 4,
                    fill: false,
                    data: chart_percentageChanges[3]
                },
                {
                    label: '5호선 혼잡율',
                    borderColor: 'rgb(153,108,172)',
                    borderWidth: 4,
                    fill: false,
                    data: chart_percentageChanges[4]
                },
                {
                    label: '6호선 혼잡율',
                    borderColor: 'rgb(205,124,239)',
                    borderWidth: 4,
                    fill: false,
                    data: chart_percentageChanges[5]
                },
                {
                    label: '7호선 혼잡율',
                    borderColor: 'rgb(116,127,0)',
                    borderWidth: 4,
                    fill: false,
                    data: chart_percentageChanges[6]
                },
                {
                    label: '8호선 혼잡율',
                    borderColor: 'rgb(230,24,108)',
                    borderWidth: 4,
                    fill: false,
                    data: chart_percentageChanges[7]
                },
                {
                    label: '9호선 혼잡율',
                    borderColor: 'rgb(189,176,146)',
                    borderWidth: 4,
                    fill: false,
                    data: chart_percentageChanges[8]
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                },
            },
        },
    });
    setInterval(flow_rate, 1000);
}

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

function updateChart() {
    percentageChart.data.labels = Array.from({length: 10}, (_, i) => '');
    percentageChart.data.labels.push('');
    percentageChart.data.datasets.forEach((dataset, index) => {
        dataset.data = chart_percentageChanges[index];
    });
    percentageChart.update();
}

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
    trafficContainer.append($(`<canvas height="140" id="percentageChart"></canvas>`));
}

// HTML 로그완료될 떄 돌릴 함수
$(CreateTrafficChart)
$(InitTrafficChart)

