import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import DiscordBotCommand from "../../../bot-command";
import DiscordBotModule from "../../../bot-module";
import WordleModule from "../module";

class WordleGuessCommand extends DiscordBotCommand {
    games: {
        user: string;
        word: string;
        guesses: string[];
    }[] = [];

    module: WordleModule;

    constructor(module) {
        super(module);

        this.command = new SlashCommandBuilder()
            .setName("guess")
            .setDescription("Guess a word in the Wordle game")
            .addStringOption((option) =>
                option.setName("word").setDescription("The word to guess").setRequired(true)
            );
    }

    async execute(interaction: ChatInputCommandInteraction) {
        const word = interaction.options.getString('word');

        if(word.length !== 5){
            interaction.reply('Your guess must be 5 letters long!');
            return;
        }

        if(!this.module.wordleWords.includes(word)){
            interaction.reply('That is not a valid word!');
            return;
        }

        
        let game = this.module.games.find((game) => game.user == interaction.user.username);

        if(word == game.word){
            interaction.reply('You guessed the word! You win!');
            return;
        }
        
        game.guesses.push(word);

        this.module.drawBoard(interaction.user.username, interaction);
        
    }

}

export default WordleGuessCommand;
