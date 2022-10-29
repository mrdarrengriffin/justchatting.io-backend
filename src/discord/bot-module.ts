import { ChatInputCommandInteraction, REST, Routes } from "discord.js";
import path = require("path");
import * as fs from "fs";
import DiscordBotCommand from "./bot-command";
import DiscordBot from "./bot";

abstract class DiscordBotModule {
    discordBot: DiscordBot;
    commands: DiscordBotCommand[] = [];
    dirName: string;

    constructor(dirName: string) {
        this.dirName = dirName;
    }

    declareCommand(command: DiscordBotCommand): void {
        this.commands.push(command);
    }
    
}

export default DiscordBotModule;
