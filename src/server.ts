// Dependencies
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const tmi = require("tmi.js");
import * as express from 'express';

const fs = require("fs");
import mongoose from 'mongoose';

// Improts
const { createServer } = require("https");
const { Server } = require("socket.io");

// Initialize MongoDB connection
mongoose
    .connect(
        "mongodb://" +
            process.env.DB_HOST +
            ":" +
            process.env.DB_PORT +
            "/" +
            process.env.DB_NAME
    )
    .catch((e) => {
        console.log(e);
    });

    // Initialize express
const app = express();

app.use(cors());

// Intialize web server with certificate
const httpServer = createServer(
    {
        key: fs.readFileSync("./server.key"),
        cert: fs.readFileSync("./server.cert"),
    },
    app
);

// Allow any origin with express
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header(
        "Access-Control-Allow-Methods",
        "PUT, GET, POST, DELETE, OPTIONS"
    );
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Register routes
const userRoutes = require("./routes/auth/user");
const infoRoutes = require("./routes/info");

app.use("/user", userRoutes);
app.use("/info", infoRoutes);

// Allow any origin with SocketIO
const io = new Server(httpServer, {
    allowEIO3: true,
    cors: {
        credentials: true,
        origin: true,
    },
});

(global as any).io = io;

// TESTING
const tmiInstance = new tmi.Client({
    channels: ['caedrel'],
});

tmiInstance.connect();

tmiInstance.on("message", (channel, tags, message, self) => {
    io.to('wirtual').emit('chatMessage', { channel, tags, message });
});

io.on("connection", (socket) => {
    console.log("someone connected");
    socket.join('wirtual');
    socket.on('join', function(){
        console.log('hi')
    })
});

httpServer.listen(2083);
console.log('Ready!');