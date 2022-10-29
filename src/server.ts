// Dependencies
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const tmi = require("tmi.js");
import * as express from "express";

const fs = require("fs");
import mongoose from "mongoose";
import DiscordBot from "./discord/bot";
import WordleModule from "./discord/modules/wordle/module";

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

// Initialise Discord Bot
const discordBot = new DiscordBot();

// Initialise Discord Wordle
const wordleModule = new WordleModule();

discordBot.registerModule(wordleModule);
discordBot.registerCommands();
discordBot.connect();

// Listen for board events to serve the game state image
app.use("/wordle", async (req, res) => {

      res.status(201).json(wordleModule.getGamesWithoutAnswer());
});


// TESTING
const tmiInstance = new tmi.Client({
    identity: {
        username: "JustChattingIO",
        password: process.env.TWITCH_CHAT_OAUTH,
    },
    channels: ["mrdarrengriffin"],
});

tmiInstance.connect();

// Temporary storage for music queue
const playlists = [];

tmiInstance.on("message", (channel, tags, message, self) => {
    io.to(channel.replace("#", "")).emit("chatMessage", {
        channel,
        tags,
        message,
        self,
    });
    // Only limit bot to one channel and user for now
    if (
        channel == "#mrdarrengriffin" &&
        message.includes("!song") &&
        tags.username == "mrdarrengriffin"
    ) {
        // Just text code, need to replace
        var commandParts = message.split(" ");
        if (commandParts.length < 2) {
            tmiInstance.say(
                tags.username,
                `@${tags.username}, Please paste the song URL: !song <URL>`
            );
            return;
        } else if (commandParts.length > 2) {
            tmiInstance.say(
                tags.username,
                `@${tags.username}, We just need the URL: !song <URL>`
            );
            return;
        }

        // Check to see if playlist is created
        if (playlists[channel.replace("#", "")] == undefined) {
            playlists[channel.replace("#", "")] = [];
        }

        playlists[channel.replace("#", "")].push({
            username: tags.setTheUsername,
            url: commandParts[1],
        });

        var playlistLength = playlists[channel.replace("#", "")].length;

        // Emit playlist change to frontend
        io.emit("playlistAdd", {
            username: tags.username,
            url: commandParts[1],
            timestamp: Date.now(),
        });

        tmiInstance.say(
            channel,
            `@${tags.username}, Song added to streamers playlist and is in position ${playlistLength}`
        );

        console.log(playlists);
    }
});

let socketRooms = [];

io.on("connection", (socket) => {
    // Connect event
    console.log(`[${socket.id}] Connected`);

    // Disconnect event
    socket.on("disconnect", () => {
        // Eject user from all rooms
        if (!socketRooms[socket.id]) {
            return;
        }
        socketRooms[socket.id].forEach((room) => {
            socket.leave(room);
        });
        // Delete user from rooms array
        delete socketRooms[socket.id];
    });

    // Join room
    socket.on("join", function (streamer) {
        // If user not in rooms array, add them
        if (!socketRooms[socket.id]) {
            socketRooms[socket.id] = [];
        }

        // If we're not already listening for this streamer, join their chat
        if (!tmiInstance.channels.includes("#" + streamer)) {
            tmiInstance
                .join(streamer)
                .then(() => {
                    console.log(
                        `[${socket.id}] Joined chat room ${streamer} successfully`
                    );
                    tmiInstance.color('yellowgreen');
                })
                .catch((err) => {
                    console.log(
                        `[${socket.id}] Error joining room ${streamer}: ${err}`
                    );
                });
        }

        // Eject user from all rooms
        // NOTE - This may be replaced when working on split-window chat
        socketRooms[socket.id].forEach((room) => {
            socket.leave(room);
            console.log(`[${socket.id}] Stopped listening for ${room}`);
        });

        // Add the streamer to the socket room
        socketRooms[socket.id].push(streamer);
        socket.join(streamer);

        console.log(`[${socket.id}] Started listening for ${streamer}`);
    });
});

httpServer.listen(2083);
console.log("Ready!");
