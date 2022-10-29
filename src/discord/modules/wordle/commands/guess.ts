import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
} from "discord.js";
import DiscordBotCommand from "../../../bot-command";
import WordleModule from "../module";
import { IWordleGame } from "../interfaces/WordleGame";
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
                option
                    .setName("word")
                    .setDescription("The word to guess")
                    .setRequired(true)
            );
    }

    async execute(interaction: ChatInputCommandInteraction) {
        if (!this.module.gameExistsForUser(interaction.user)) {
            await interaction.reply(
                "You don't have a game in progress. Use the /wordle to start a game."
            );
            return;
        }

        const word = interaction.options.getString("word");

        if (word.length !== 5) {
            interaction.reply("Your guess must be 5 letters long!");
            return;
        }

        if (!this.module.wordleWords.includes(word)) {
            interaction.reply("That is not a valid word!");
            return;
        }

        let game: IWordleGame = this.module.games.find(
            (game) => game.user.username == interaction.user.username
        );

        game.guesses.push(word);

        if (word == game.word) {
            game.state = "win";
            await interaction.reply({ embeds: [this.module.getBoardEmbed(game)] });
            //this.module.destroyGame(game);
            return;
        }

        if (game.guesses.length == 5) {
            game.state = "fail";
            await interaction.reply({ embeds: [this.module.getBoardEmbed(game)] });
            //this.module.destroyGame(game);
            return;
        }

        await interaction.reply({ embeds: [this.module.getBoardEmbed(game)] });
    }
}

export default WordleGuessCommand;
