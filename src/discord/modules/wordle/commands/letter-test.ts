import { EmbedBuilder } from "@discordjs/builders";
import { SlashCommandBuilder, ChatInputCommandInteraction, Emoji, parseEmoji } from "discord.js";
import DiscordBotCommand from "../../../bot-command";
import DiscordBotModule from "../../../bot-module";
import WordleModule from "../module";

class WordleLetterTestCommand extends DiscordBotCommand {

    module: WordleModule;

    constructor(module) {
        super(module);

        this.command = new SlashCommandBuilder()
            .setName("letter-test")
            .setDescription("Outputs all the letter emojis");
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder();
        const emoji = this.module.discordBot.client.emojis.resolveId(this.module.letters.yellow.p);
        let emojis = [];

        const test = 'test';
        test.split('').forEach((letter) => {
            emojis.push(this.module.letters.blank);
        });

        embed.addFields([{value:emojis.join(' '), name:'Wordle', inline:true}]); 
        interaction.reply({embeds:[embed]});
    }
}

export default WordleLetterTestCommand;
