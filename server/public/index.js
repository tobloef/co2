const delay = 1000;

let latestData;
let duration = 1000 * 60;

const ctx = document.getElementById("chart").getContext("2d");
let chart = new Chart(ctx, {
    type: "line",
    data: {
        datasets: [
            {
                label: "CO₂ PPM",
                yAxisID: "co2",
                borderColor: "black",
                fill: true,
                lineTension: 0,
                pointRadius: 0,
                data: []
            }
        ]
    },
    options: {
        tooltips: {
            enabled: false,
        },
        scales: {
            xAxes: [{
                type: "realtime",
                realtime: {
                    delay: delay,
                    duration: duration,
                    ttl: Infinity,
                    onRefresh: (chart) => {
                        if (latestData == null) {
                            return;
                        }
                        latestData = {
                            ...latestData,
                            x: Date.now()
                        };
                        pushData(latestData);
                    },
                },
                gridLines: {
                    display: false
                }
            }],
            yAxes: [
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "CO₂ PPM"
                    },
                    ticks: {
                        min: 0,
                        max: 1500,
                    },
                    position: "left",
                    id: "co2",
                    gridLines: {
                        display: true
                    }
                }
            ]
        },
        annotation: {
            annotations: [
                {
                    drawTime: "afterDatasetsDraw",
                    type: "line",
                    mode: "horizontal",
                    scaleID: "co2",
                    value: 350,
                    borderColor: "green",
                    borderWidth: 1
                },
                {
                    drawTime: "afterDatasetsDraw",
                    type: "line",
                    mode: "horizontal",
                    scaleID: "co2",
                    value: 800,
                    borderColor: "orange",
                    borderWidth: 1
                },
                {
                    drawTime: "afterDatasetsDraw",
                    type: "line",
                    mode: "horizontal",
                    scaleID: "co2",
                    value: 1200,
                    borderColor: "red",
                    borderWidth: 1
                },
            ]
        }
    }
});

const socket = io();
socket.on("data", newData => {
    if (chart == null) {
        return;
    }
    for (let data of newData) {
        latestData = data.co2;
        pushData(data.co2);
    }
    chart.update();
});

function pushData(newData) {
    document.getElementById("co2-count").textContent = newData.y;
    chart.config.data.datasets[0].data.push(newData);
    updateDuration();
}

function updateDuration() {
    const value = document.getElementById("duration").value;
    if (value === "all") {
        const data = chart.config.data.datasets[0].data;
        duration = data[data.length - 1].x - data[0].x;
    } else {
        duration = parseInt(value);
    }
    chart.config.options.scales.xAxes[0].realtime.duration = duration;
}