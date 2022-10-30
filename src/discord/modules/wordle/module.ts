import { EmbedBuilder, User } from "discord.js";
import DiscordBotModule from "../../bot-module";
import * as fs from "fs";
import * as path from "path";
import WordleWordleCommand from "./commands/wordle";
import DiscordBot from "../../bot";
import { IWordleGame } from "./interfaces/WordleGame";
import WordleGuessCommand from "./commands/wordle/guess";
import WordleNewCommand from "./commands/wordle/new";
import { IWordleLetters } from "./interfaces/Letters";

export enum WORDLE_GAME_STATE {
    IDLE,
    PLAYING,
    FAIL,
    WIN,
}
class WordleModule extends DiscordBotModule {
    discordBot: DiscordBot;
    letters: IWordleLetters = require("./helpers/letters");
    games: IWordleGame[] = [];

    wordleWords: string[];
    wordleAcceptableWords: string[];

    constructor() {
        super(__dirname);

        this.declareCommand(new WordleWordleCommand(this), [
            new WordleNewCommand(this),
            new WordleGuessCommand(this),
        ]);

        console.log(this.letters.green.a);
        this.loadWords();
    }

    private loadWords() {
        const wordsFile = fs.readFileSync(
            path.join(__dirname, "/wordle-list.txt")
        );
        const words = wordsFile.toString().split("\n");
        this.wordleWords = words;

        const acceptableWordsFile = fs.readFileSync(
            path.join(__dirname, "/wordle-acceptable.txt")
        );
        const acceptableWords = acceptableWordsFile.toString().split("\n");
        this.wordleAcceptableWords = acceptableWords;
    }

    pickRandomWord(): string {
        return this.wordleWords[
            Math.floor(Math.random() * this.wordleWords.length)
        ];
    }

    gameExistsForUser(user: User) {
        return (
            this.games &&
            this.games.filter(
                (game) =>
                    game.user.username == user.username &&
                    game.state == "playing"
            ).length > 0
        );
    }

    startNewGame(user: User) {
        const word = this.pickRandomWord();

        const game: IWordleGame = {
            id: Math.random().toString(36).substr(2, 9),
            lastUpdated: new Date(),
            user,
            word,
            state: 'playing',
            guesses: [],
            board: [],
        };

        this.games.push(game);

        return game;
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

        let stateRows = [];
        for (let i = 0; i < 5; i++) {
            stateRows[i] = [];
            for (let j = 0; j < 5; j++) {
                stateRows[i][j] = 0;
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
                let letterState;

                if (letter == correctWordSplit[letterIndex]) {
                    // GREEN: Letter is in word and in correct position
                    letterEmoji = this.letters.green[letter];
                    letterState = 3;
                } else if (correctWordSplit.includes(letter)) {
                    // YELLOW: Letter is in word but in the incorrect position
                    letterEmoji = this.letters.yellow[letter];
                    letterState = 2;
                } else {
                    // GREY: Letter is not in the word
                    letterEmoji = this.letters.grey[letter];
                    letterState = 1;
                }

                if (letterCounts[letter] !== undefined) {
                    letterCounts[letter].guessed =
                        letterCounts[letter].guessed + 1;
                }

                emojiRows[wordIndex][letterIndex] = letterEmoji;
                stateRows[wordIndex][letterIndex] = letterState;
            });

            currentWordSplit.forEach((letter, letterIndex) => {
                if (
                    correctWordSplit.includes(letter) &&
                    letterCounts[letter].guessed > letterCounts[letter].count
                ) {
                    emojiRows[wordIndex][letterIndex] =
                        this.letters.grey[letter];
                    stateRows[wordIndex][letterIndex] = 1;
                    letterCounts[letter].guessed =
                        letterCounts[letter].guessed - 1;
                }
            });
        });

        game.board = stateRows;

        embed.setAuthor({
            name: game.user.username,
            iconURL: game.user.avatarURL(),
        });

        let description = emojiRows.map((rows) => rows.join("")).join("\n");
        if (game.state == "win") {
            description += "\n\nCongratulations! You won!";
        } else if (game.state == "fail") {
            description +=
                "\n\nYou ran out of guesses! The word was: " + game.word;
        } else {
            description += "\n\nUse /guess <word> to try and solve the puzzle";
        }

        embed.setDescription(description);

        return embed;
    }

    destroyGame(game) {
        this.games = this.games.filter((g) => g.id !== game.id);
        this.updateIORoom();
    }

    getGamesWithoutAnswer() {
        return this.games.map((game) => {
            return {
                id: game.id,
                lastUpdated: game.lastUpdated,
                user: {username: game.user.username, avatar: game.user.avatarURL()},
                word: game.word,
                guesses: game.guesses,
                board: game.board,
                state: game.state,
            };
        });
    }

    updateIORoom(){
        this.discordBot.io.to('wordle').emit('wordleUpdate', this.getGamesWithoutAnswer());
    }
}

export default WordleModule;
