import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import DiscordBotModule from "./bot-module";

abstract class DiscordBotCommand {

    command: SlashCommandBuilder | SlashCommandSubcommandBuilder | any;
    module: DiscordBotModule;

    constructor(module: DiscordBotModule){
        this.module = module;
    }

    async execute(interaction: ChatInputCommandInteraction) {
        
    }
}

export default DiscordBotCommand;
