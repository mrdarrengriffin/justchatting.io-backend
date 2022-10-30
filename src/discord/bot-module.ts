import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import DiscordBotCommand from "./bot-command";
import DiscordBot from "./bot";
import DiscordBotSubCommand from "./bot-subcommand";
import { IModuleCommand } from "./modules/wordle/interfaces/ModuleCommand";

abstract class DiscordBotModule {
    discordBot: DiscordBot;
    commands: IModuleCommand[] = [];
    dirName: string;

    constructor(dirName: string) {
        this.dirName = dirName;
    }

    declareCommand(
        command: DiscordBotCommand,
        subcommands?: DiscordBotSubCommand[]
    ) {
        let subcommandsTemp = [];
        if (subcommands) {
            subcommands.forEach((subcommand) => {
                command.command.addSubcommand(subcommand.command);
                subcommandsTemp.push(subcommand);
            });
        }
        this.commands.push({command: command, subcommands: subcommandsTemp});
    }

    declareSubcommand(
        command: SlashCommandSubcommandBuilder,
        parentCommand: SlashCommandBuilder
    ): void {
        parentCommand.addSubcommand((p) => {
            return command;
        });
    }
}

export default DiscordBotModule;
