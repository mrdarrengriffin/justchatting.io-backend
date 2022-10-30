import { User } from "discord.js";

export interface IWordleGame {
    id: string;
    user: User;
    state: 'playing'|'win'|'fail';
    word: string;
    guesses: string[];
}

