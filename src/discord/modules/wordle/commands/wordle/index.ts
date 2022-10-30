import { SlashCommandBuilder, ChatInputCommandInteraction, User, SlashCommandSubcommandBuilder } from "discord.js";
import DiscordBotCommand from "../../../../bot-command";
import { IWordleGame } from "../../interfaces/WordleGame";
import WordleModule, { WORDLE_GAME_STATE } from "../../module";
import WordleGuessCommand from "./guess";

class WordleWordleCommand extends DiscordBotCommand {


    module: WordleModule;

    constructor(module) {
        super(module);

        this.command = new SlashCommandBuilder()
            .setName("wordle")
            .setDescription("Start a new Wordle game")

    }

    async execute(interaction: ChatInputCommandInteraction) {
        const existingGame = this.module.gameExistsForUser(interaction.user);
        if(existingGame){
            await interaction.reply('You already have a game in progress! If you want to start a new game, use the /wordle command again.');
            return;
        }

        const game = this.module.startNewGame(interaction.user);

        interaction.reply({ embeds: [this.module.getBoardEmbed(game)] });
    }  

    
}

export default WordleWordleCommand;
