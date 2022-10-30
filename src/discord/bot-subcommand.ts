import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import DiscordBotModule from "./bot-module";

abstract class DiscordBotSubcommand {

    command: SlashCommandSubcommandBuilder;
    module: DiscordBotModule;

    constructor(module: DiscordBotModule){
        this.module = module;
    }

    async execute(interaction: ChatInputCommandInteraction) {
        
    }
}

export default DiscordBotSubcommand;
