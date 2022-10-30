import { EmbedBuilder, User } from "discord.js";
import DiscordBotModule from "../../bot-module";
import * as fs from "fs";
import * as path from "path";
import WordleWordleCommand from "./commands/wordle";
import WordleLetterTestCommand from "./commands/letter-test";
import DiscordBot from "../../bot";
import WordleGuessCommand from "./commands/guess";
import { IWordleGame } from "./interfaces/WordleGame";

export enum WORDLE_GAME_STATE {
    IDLE,
    PLAYING,
    FAIL,
    WIN,
}
class WordleModule extends DiscordBotModule {
    discordBot: DiscordBot;
    letters = require("./helpers/letters");
    games: IWordleGame[] = [];
    
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

    gameExistsForUser(user: User) {
        return (
            this.games &&
            this.games.filter((game) => game.user.username == user.username && game.state == "playing").length > 0
        );
    }

    getBoardEmbed(game: IWordleGame) {
        const embed = new EmbedBuilder();

        let emojiRows = [];
        for (let i = 0; i < 5; i++) {
            emojiRows[i] = [];
            for (let j = 0; j < 5; j++) {
                emojiRows[i][j] = this.letters.blank;
            }
        }

        game.guesses.forEach((word, wordIndex) => {
            const correctWordSplit = game.word.split("");
            const currentWordSplit = word.split("");

            let letterCounts = {};
            correctWordSplit.forEach((letter, letterIndex) => {
                if (!letterCounts[letter]) {
                    letterCounts[letter] = { count: 1, guessed: 0 };
                } else {
                    letterCounts[letter].count = letterCounts[letter].count + 1;
                }
            });

            currentWordSplit.forEach((letter, letterIndex) => {
                let letterEmoji;

                if (letter == correctWordSplit[letterIndex]) {
                    // GREEN: Letter is in word and in correct position
                    letterEmoji = this.letters.green[letter];
                } else if (correctWordSplit.includes(letter)) {
                    // YELLOW: Letter is in word but in the incorrect position
                    letterEmoji = this.letters.yellow[letter];
                } else {
                    // GREY: Letter is not in the word
                    letterEmoji = this.letters.grey[letter];
                }

                if (letterCounts[letter] !== undefined) {
                    letterCounts[letter].guessed =
                        letterCounts[letter].guessed + 1;
                }

                emojiRows[wordIndex][letterIndex] = letterEmoji;
            });

            currentWordSplit.forEach((letter, letterIndex) => {
                if (
                    correctWordSplit.includes(letter) &&
                    letterCounts[letter].guessed > letterCounts[letter].count
                ) {
                    emojiRows[wordIndex][letterIndex] =
                        this.letters.grey[letter];
                    letterCounts[letter].guessed =
                        letterCounts[letter].guessed - 1;
                }
            });
        });

        embed.setAuthor({name: game.user.username, iconURL: game.user.avatarURL()});

        let description = emojiRows.map((rows) => rows.join("")).join("\n");
        if(game.state == "win") {
            description += "\n\nCongratulations! You won!";
        }else if(game.state == "fail") {
            description += "\n\nYou ran out of guesses! The word was: " + game.word;
        }else{
            description += "\n\nUse /guess <word> to try and solve the puzzle";
        }

        embed.setDescription(description);

        return embed;
    }

    destroyGame(game) {
        this.games = this.games.filter((g) => g.id !== game.id);
    }

    getGamesWithoutAnswer() {
        return this.games.map((game) => {
            return {
                user: game.user.username,
                word: game.word,
                guesses: game.guesses,
                state: game.state
            }    
        });
    }
}

export default WordleModule;
