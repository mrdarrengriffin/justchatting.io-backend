import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import DiscordBotModule from "../../bot-module";
import * as fs from "fs";
import * as path from "path";
const { loadImage, createCanvas } = require("canvas");
import WordleWordleCommand from "./commands/wordle";
import WordleLetterTestCommand from "./commands/letter-test";
import DiscordBot from "../../bot";
import WordleGuessCommand from "./commands/guess";

class WordleModule extends DiscordBotModule {
    discordBot: DiscordBot;
    letters = require("./helpers/letters");
    games: {
        user: string;
        word: string;
        guesses: string[];
    }[] = [];
    wordleWords: string[];

    constructor() {
        super(__dirname);
        this.declareCommand(new WordleWordleCommand(this));
        this.declareCommand(new WordleGuessCommand(this));
        this.declareCommand(new WordleLetterTestCommand(this));
        console.log(this.letters.green.a);
        this.loadWords();
    }

    private loadWords() {
        const wordsFile = fs.readFileSync(
            path.join(__dirname, "/wordle-list.txt")
        );
        const words = wordsFile.toString().split("\n");
        this.wordleWords = words;
    }

    pickRandomWord(): string {
        return this.wordleWords[
            Math.floor(Math.random() * this.wordleWords.length)
        ];
    }

    drawBoard(username: string, interaction: ChatInputCommandInteraction) {
        const embed = new EmbedBuilder();

        const game = this.games.find((game) => game.user == username);

        if (!game) {
            interaction.reply("You don't have a game in progress!");
            return;
        }

        let emojiRows = [];

        game.guesses.forEach((word) => {
            let emojiRow = [];

            word.split("").forEach((letter) => {
                emojiRow.push(this.letters.grey[letter]);
            });

            emojiRows.push(emojiRow.join(""));
        });
        console.log(emojiRows);
   
        embed.addFields({
            value: emojiRows.join("\n"),
            name: "Wordle"
        });

        interaction.reply({ embeds: [embed] }).catch(error => { console.log(error); });
    }
}

export default WordleModule;
