const path = require("path");
const express = require("express");
const http = require("http");
const socket = require("socket.io");

const PORT = 3000;
const PASSWORD = "DEFAULT_PASSWORD";

const app = express();
const server = http.createServer(app);
const io = socket(server);

dataLog = [];

app.use(express.static(path.join(__dirname, '/public')));

io.on("connection", socket => {
    socket.emit("data", dataLog);

    socket.on("data", (data) => {
        if (data.password === PASSWORD) {
            const newData = {
                co2: {
                    y: data.co2,
                    x: data.time
                },
                temp: {
                    y: data.temp,
                    x: data.time
                }
            };
            dataLog.push(newData);
            io.emit("data", [newData]);
        }
    });
});

server.listen(PORT, () => {
   console.log(`CO2 Monitor server listening on port ${PORT}`);
});