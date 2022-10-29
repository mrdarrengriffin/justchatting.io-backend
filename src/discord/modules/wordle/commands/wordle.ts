import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import DiscordBotCommand from "../../../bot-command";
import WordleModule from "../module";

class WordleWordleCommand extends DiscordBotCommand {


    module: WordleModule;

    constructor(module) {
        super(module);

        this.command = new SlashCommandBuilder()
            .setName("wordle")
            .setDescription("Start a new Wordle game");
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const existingGame = this.gameExistsForUser(interaction.user.username);
        if(existingGame){
            console.log(this.module.games, interaction.user.username);
            await interaction.reply('You already have a game in progress! If you want to start a new game, use the /wordle command again.');
            return;
        }

        this.startNewGame(interaction.user.username);

        interaction.reply('Heck yeah, let\'s go!').then(interactionResponse => {
            console.log(interactionResponse);
        })
    }

    gameExistsForUser(user){
        return !this.module.games && !!this.module.games.filter((game) => game.user == user);
    }

    startNewGame(user: string) {
        this.module.games = this.module.games.filter((game) => game.user !== user);

        //const word = this.module.pickRandomWord();
        const word = this.module.pickRandomWord();

        this.module.games.push({
            user,
            word,
            guesses: [],
        });

        return "ok";
    }
}

export default WordleWordleCommand;
