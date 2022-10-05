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
const twitchEmotes = require("./routes/twitch/emotes");
const userRoutes = require("./routes/auth/user");
const infoRoutes = require("./routes/info");

app.use("/user", userRoutes);
app.use("/info", infoRoutes);
app.use("/twitch/emotes", twitchEmotes);

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
    channels: [],
});

tmiInstance.connect();

tmiInstance.on("message", (channel, tags, message, self) => {
    io.to(channel.replace('#', '')).emit('chatMessage', { channel, tags, message });
});

let socketRooms = [];

io.on("connection", (socket) => {
    // Connect event
    console.log(`[${socket.id}] Connected`);
    
    // Disconnect event
    socket.on("disconnect", () => {
        // Eject user from all rooms
        console.log(socketRooms);
        if(!socketRooms[socket.id]){
            return
        }
        socketRooms[socket.id].forEach((room) => {
            socket.leave(room);
        });
        // Delete user from rooms array
        delete socketRooms[socket.id];
    });
    
    // Join room
    socket.on('join', function(streamer){
        // If user not in rooms array, add them
        if(!socketRooms[socket.id]){
            socketRooms[socket.id] = [];
        }

        // If we're not already listening for this streamer, join their chat
        if(!tmiInstance.channels.includes('#' + streamer)){
            tmiInstance.join(streamer);
        }

        // Eject user from all rooms
        // NOTE - This may be replaced when working on split-window chat
        socketRooms[socket.id].forEach(room => {
            socket.leave(room);
            console.log(`[${socket.id}] Stopped listening for ${room}`);
        })
        
        // Add the streamer to the socket room
        socketRooms[socket.id].push(streamer);        
        socket.join(streamer);

        console.log(`[${socket.id}] Started listening for ${streamer}`);
    })
});

httpServer.listen(2083);
console.log('Ready!');