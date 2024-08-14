const GRAPH_CFG = {
    type: "line",
        data: {
    datasets: [{
        label: 'Acceleration',
        data: [],
        backgroundColor: 'rgba(255,255,255, 0.3)',
        borderColor: 'rgba(255,255,255, 1)',
        borderWidth: 1.5,
        fill: true
    }]
},
    options: {
        tooltips: {enabled: false},
        hover: {mode: 'none'},
        animation: false,
        animations: {y: false, x: false},
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 6,
        legend: {
            display: false
        },
        elements: {
            point:{
                radius: 0
            },
            line: {
                tension: 0
            }
        },
        scales : {
            yAxes : [{
                gridLines: {
                    drawTicks: false,
                    color: 'rgba(255,255,255, 0.2)'
                },
                ticks : {
                    padding: 10,
                    beginAtZero : true,
                    suggestedMin: 0,
                    suggestedMax: 1
                }
            }],
                xAxes : [{
                gridLines: {
                    drawTicks: false,
                    color: 'rgba(255,255,255, 0.2)'
                },
                ticks: {
                    padding: 10,
                    maxTicksLimit: 20
                }
            }]
        }
    }
}