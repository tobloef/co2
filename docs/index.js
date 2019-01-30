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
            },
            {
                label: "Temperature °C",
                yAxisID: "temp",
                borderColor: "orange",
                fill: true,
                lineTension: 0,
                pointRadius: 0,
                data: []
            },
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
                            co2: {
                                y: latestData.co2.y,
                                x: Date.now()
                            },
                            temp: {
                                y: latestData.temp.y,
                                x: Date.now()
                            }
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
                },
                {
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Temperature °C"
                    },
                    ticks: {
                        min: -10,
                        max: 40,
                    },
                    position: "right",
                    id: "temp",
                    gridLines: {
                        display: false
                    }
                }
            ]
        },
        annotation: {
            events: ["mouseover", "mouseout"],
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

const socket = io("https://server.tobloef.com", { path: "/co2/socket.io" });
socket.on("error", console.error);
socket.on("connect_error", console.error);
socket.on("data", newData => {
    if (chart == null) {
        return;
    }
    for (let data of newData) {
        latestData = data;
        pushData(data);
    }
    chart.update();
});

function pushData(newData) {
    console.log("Got data", newData);
    document.getElementById("current-location").textContent = newData.location;
    document.getElementById("current-co2").textContent = `${newData.co2.y} PPM`;
    document.getElementById("current-temp").textContent = `${newData.temp.y} °C`;
    chart.config.data.datasets[0].data.push(newData.co2);
    chart.config.data.datasets[1].data.push(newData.temp);
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