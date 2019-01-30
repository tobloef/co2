const Co2Monitor = require("./co2-monitor");
const io = require("socket.io-client");

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
    co2Monitor.on(type, value => {
        value = parseFloat(value);
        if (true || lastData[type] !== value) {
            const newData = {
                ...lastData,
                password: PASSWORD,
                time: Date.now(),
                [type]: value
            };
            console.log("Read CO2", newData.co2);
            socket.emit("data", newData);
            lastData = newData;
        }
    });
}



const socket = io("https://server.tobloef.com", { path: "/co2/socket.io" });
socket.on("connect", () => {
    console.log("Connected to server.");
    setupCO2Monitor();
});
socket.on("error", console.error);
socket.on("connect_error", console.error);
let lastData = {
    location: process.argv.slice(2).join(" ")
};