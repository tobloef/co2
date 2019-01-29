const Co2Monitor = require("./co2-monitor");
const socket = require("socket.io-client");

const URL = "199.247.24.20:3000";
const PASSWORD = "DEFAULT_PASSWORD";

function setupCO2Monitor() {
    let co2Monitor = new Co2Monitor();
    co2Monitor.on("connected", () => {
        console.log("Connected to CO2 monitor");
        co2Monitor.startTransfer();
    });
    co2Monitor.on("error", console.error);
    addDataListener("co2", co2Monitor);
    addDataListener("temp", co2Monitor);
    co2Monitor.connect();
}

function addDataListener(type, co2Monitor) {
    console.log("addDataListener", Date.now());
    co2Monitor.on(type, value => {
        value = parseFloat(value);
        if (true || lastData[type] !== value) {
            const newData = {
                ...lastData,
                password: PASSWORD,
                time: Date.now(),
                [type]: value
            };
            io.emit("data", newData);
            lastData = newData;
        }
    });
}
const io = socket(URL);
io.on("connect", () => {
    console.log("Connected to server.");
    setupCO2Monitor();
});
let lastData = {};