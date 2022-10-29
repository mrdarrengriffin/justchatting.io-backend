import { User } from "discord.js";

export interface IWordleGame {
    user: User;
    state: 'playing'|'win'|'fail';
    word: string;
    guesses: string[];
}

