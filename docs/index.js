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
                            co2: {
                                ...latestData.co2,
                                x: Date.now()
                            },
                            temp: {
                                ...latestData.temp,
                                x: Date.now()
                            }
                        ;
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
                    borderWidth: 1,
                    label: {
                        enabled: false,
                        content: "Atmospheric average PPM"
                    },
                    onMouseOver: handleLabelMouseOver,
                    onMouseOver: handleLabelMouseOut,
                },
                {
                    drawTime: "afterDatasetsDraw",
                    type: "line",
                    mode: "horizontal",
                    scaleID: "co2",
                    value: 800,
                    borderColor: "orange",
                    borderWidth: 1,
                    label: {
                        enabled: false,
                        content: "Max recommended PPM"
                    },
                    onMouseOver: handleLabelMouseOver,
                    onMouseOver: handleLabelMouseOut,
                },
                {
                    drawTime: "afterDatasetsDraw",
                    type: "line",
                    mode: "horizontal",
                    scaleID: "co2",
                    value: 1200,
                    borderColor: "red",
                    borderWidth: 1,
                    label: {
                        enabled: false,
                        content: "High PPM!"
                    },
                    onMouseOver: handleLabelMouseOver,
                    onMouseOver: handleLabelMouseOut,
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
        latestData = data.co2;
        pushData(data);
    }
    chart.update();
});

function pushData(newData) {
    console.log("Got CO2", newData.y);
    document.getElementById("current-co2").textContent = newData.co2.y;
    document.getElementById("current-temp").textContent = newData.temp.y;
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

function handleLabelMouseOver(e) {
    console.log("handleLabelMouseOver");
    this.options.borderWidth = 3;
    this.options.enabled = true;
    this.options.chartInstance.update();
    this.chartInstance.chart.canvas.style.cursor = "pointer";
}

function handleLabelMouseOut(e) {
    console.log("handleLabelMouseOut");
    this.options.borderWidth = 1;
    this.options.enabled = false;
    this.options.chartInstance.update();
    this.chartInstance.chart.canvas.style.cursor = "initial";
}