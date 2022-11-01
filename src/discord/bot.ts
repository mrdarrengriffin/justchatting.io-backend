import DiscordBotModule from "./bot-module";

import {
    Client,
    Events,
    GatewayIntentBits,
    InteractionCollector,
    REST,
    Routes,
} from "discord.js";
import { Server } from "socket.io";

class DiscordBot {
    client: Client;
    io: Server;
    modules: DiscordBotModule[] = [];

    constructor() {
        // Create the client instance
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
        
        // Attempt to login
        this.client.login(process.env.DISCORD_TOKEN);

        // Log when the bot is loggedin and ready
        this.client.on("ready", () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
        });

        // When a command is executed, run the execute function of the command
        this.client.on(Events.InteractionCreate, async (interaction) => {
            // If it's not a command, ignore it
            if (!interaction.isChatInputCommand()) {
                return;
            }

            // Get the actual command name from the message
            const { commandName } = interaction;

            // Loop through each module
            this.modules.forEach((module) => {
                // Loop through each command of the module
                module.commands.forEach((command) => {
                    // If the iteration of the module command matches that of the message command...
                    if (command.command.command.name === commandName) {
                        // Run the execute function and stop after the first match
                        if (
                            interaction.options.getSubcommand() &&
                            command.subcommands.length > 0
                        ) {
                            const subcommandName =
                                interaction.options.getSubcommand();
                            command.subcommands.forEach((subcommand) => {
                                if (subcommand.command.name == subcommandName) {
                                    subcommand.execute(interaction);
                                    console.log(subcommandName + " executed");
                                    return;
                                }
                            });
                        } else {
                            command.command.execute(interaction);
                            return;
                        }
                    }
                });
            });
        });
    }

    // Adds any registered modules to the bot. Used when registering commands
    registerModule(module: DiscordBotModule) {
        module.discordBot = this;
        this.modules.push(module);
    }

    /**
     * Registers all commands for all modules
     */
    async registerCommands() {
        // Construct and prepare an instance of the REST module
        const rest = new REST({ version: "10" }).setToken(
            process.env.DISCORD_TOKEN
        );

        // Delete all guild commands
        await rest
            .put(
                Routes.applicationCommand(
                    process.env.DISCORD_CLIENT_ID,
                    process.env.DISCORD_GUILD_ID
                ),
                {
                    body: [],
                }
            )
            .then((a) =>
                console.log("Successfully deleted all guild commands.", a)
            )
            .catch(console.error);

        // Loop through each module
        this.modules.forEach(async (module) => {
            // Initialize an array of commands
            let commandsJson = [];

            // Loop through all the commands and serialize the command to JSON
            module.commands.forEach((command) => {
                commandsJson.push(command.command.command.toJSON());
            });

            // Register the commands
            try {
                console.log(
                    `[Discord][Core] Registering commands for module: ${module.constructor.name}`
                );

                // The put method is used to fully refresh all commands in the guild with the current set
                await rest
                    .put(
                        Routes.applicationGuildCommands(
                            process.env.DISCORD_CLIENT_ID,
                            process.env.DISCORD_GUILD_ID
                        ),
                        { body: commandsJson }
                    )
                    .catch((error) => {
                        console.log(error);
                    });

                console.log(
                    `[Discord][Core] Registered commands for module: ${module.constructor.name}`
                );
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        });
    }
}

export default DiscordBot;
