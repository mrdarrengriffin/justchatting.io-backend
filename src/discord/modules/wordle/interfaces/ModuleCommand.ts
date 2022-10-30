import DiscordBotCommand from "../../../bot-command";
import DiscordBotSubcommand from "../../../bot-subcommand";

export interface IModuleCommand {
    command: DiscordBotCommand;
    subcommands: DiscordBotSubcommand[];
}