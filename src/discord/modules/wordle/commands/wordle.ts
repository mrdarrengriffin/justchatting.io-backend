import { SlashCommandBuilder, ChatInputCommandInteraction, User } from "discord.js";
import DiscordBotCommand from "../../../bot-command";
import { IWordleGame } from "../interfaces/WordleGame";
import WordleModule, { WORDLE_GAME_STATE } from "../module";

class WordleWordleCommand extends DiscordBotCommand {


    module: WordleModule;

    constructor(module) {
        super(module);

        this.command = new SlashCommandBuilder()
            .setName("wordle")
            .setDescription("Start a new Wordle game");
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const existingGame = this.module.gameExistsForUser(interaction.user);
        if(existingGame){
            await interaction.reply('You already have a game in progress! If you want to start a new game, use the /wordle command again.');
            return;
        }

        const game = this.startNewGame(interaction.user);

        interaction.reply({ embeds: [this.module.getBoardEmbed(game)] });
    }  

    startNewGame(user: User) {
        this.module.games = this.module.games.filter((game) => game.user.username !== user.username);

        const word = this.module.pickRandomWord();

        const game: IWordleGame = {
            user,
            word, 
            state: 'playing',
            guesses: [],
        };

        this.module.games.push(game);

        return game;
    }
}

export default WordleWordleCommand;
