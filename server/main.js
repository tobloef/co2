const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const socket = require("socket.io");

const PORT = 3000;
const PASSWORD = "DEFAULT_PASSWORD";

const app = express();
server = http.createServer(app);
const io = socket(server, { path: "/co2/socket.io" });

dataLog = [];

io.on("connection", socket => {
    socket.emit("data", dataLog);

    socket.on("data", (data) => {
        if (data.password === PASSWORD) {
            console.log("Got CO2", data.co2);
            const newData = {
                location: data.location,
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

