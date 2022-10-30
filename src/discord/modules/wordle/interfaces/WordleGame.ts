import { User } from "discord.js";

export interface IWordleGame {
    id: string;
    lastUpdated: Date;
    user: User;
    state: 'playing'|'win'|'fail';
    word: string;
    guesses: string[];
    board: number[][];
}

