import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
SlashCommandSubcommandBuilder
} from "discord.js";
import WordleModule from "../../../module";
import { IWordleGame } from "../../../interfaces/WordleGame";
import DiscordBotSubCommand from "../../../../../bot-subcommand";
class WordleNewCommand extends DiscordBotSubCommand {

    module: WordleModule;

    constructor(module) {
        super(module);

        this.command = new SlashCommandSubcommandBuilder()
            .setName("new")
            .setDescription("Start a new game");

    }

    async execute(interaction: ChatInputCommandInteraction) {
        const existingGame: IWordleGame = this.module.games.find(
            (game) =>
                game.user.username == interaction.user.username &&
                game.state == "playing"
        );

        if(existingGame){
            console.log('destroy');
            this.module.destroyGame(existingGame)
        }

        const game = this.module.startNewGame(interaction.user);
        this.module.getBoardEmbed(game);

        this.module.updateIORoom();        
        await interaction.reply({ embeds: [this.module.getBoardEmbed(game)] });
    }
}

export default WordleNewCommand;
