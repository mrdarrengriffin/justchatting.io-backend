import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
SlashCommandSubcommandBuilder
} from "discord.js";
import WordleModule from "../../../module";
import { IWordleGame } from "../../../interfaces/WordleGame";
import DiscordBotSubCommand from "../../../../../bot-subcommand";
class WordleGuessCommand extends DiscordBotSubCommand {

    module: WordleModule;

    constructor(module) {
        super(module);

        this.command = new SlashCommandSubcommandBuilder()
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

        if (!this.module.wordleAcceptableWords.includes(word) && !this.module.wordleWords.includes(word)) {
            interaction.reply("That is not a valid word!");
            return;
        }

        let game: IWordleGame = this.module.games.find(
            (game) =>
                game.user.username == interaction.user.username &&
                game.state == "playing"
        );

        game.guesses.push(word);
        game.lastUpdated = new Date();

        if (word == game.word) {
            game.state = "win";
            await interaction.reply({
                embeds: [this.module.getBoardEmbed(game)],
            });
            this.module.updateIORoom();
            //this.module.destroyGame(game);
            return;
        }

        if (game.guesses.length == 5) {
            game.state = "fail";
            await interaction.reply({
                embeds: [this.module.getBoardEmbed(game)],
            });
            this.module.updateIORoom();
            //this.module.destroyGame(game);
            return;
        }

        
        await interaction.reply({ embeds: [this.module.getBoardEmbed(game)] });
        this.module.updateIORoom();
    }
}

export default WordleGuessCommand;
