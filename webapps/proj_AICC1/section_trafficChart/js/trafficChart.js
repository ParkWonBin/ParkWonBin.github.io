const chart_percentageChanges = [[], [], [], [], [], [], [], [], [], []];
let percentageChart;

const labels = [
    '1호선 혼잡율', '2호선 혼잡율', '3호선 혼잡율', '4호선 혼잡율',
    '5호선 혼잡율', '6호선 혼잡율', '7호선 혼잡율', '8호선 혼잡율', '9호선 혼잡율'
];

const colors = [
    'rgb(0,82,164)', 'rgb(0,168,77)', 'rgb(239,124,28)', 'rgb(0,164,227)',
    'rgb(153,108,172)', 'rgb(205,124,239)', 'rgb(116,127,0)', 'rgb(230,24,108)', 'rgb(189,176,146)'
];


function InitTrafficChart() {
    const ctx = document.getElementById('percentageChart').getContext('2d');
    const datasets = labels.map((label, index) => ({
        label: label,
        borderColor: colors[index],
        borderWidth: 4,
        fill: false,
        data: chart_percentageChanges[index]
    }));

    percentageChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 10}, (_, i) => ''),
            datasets: datasets
        },
        responsive: true,
        maintainAspectRatio: false,

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

        td.textContent = newPercentage.toFixed(0) + '%';

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
    trafficContainer.append($(`<canvas id="percentageChart"></canvas>`));
}

// HTML 로그완료될 떄 돌릴 함수
$(CreateTrafficChart)
$(InitTrafficChart)

