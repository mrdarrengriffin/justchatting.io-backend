import DiscordBotModule from "./bot-module";

import {
    Client,
    Events,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
} from "discord.js";

class DiscordBot {
    client: Client;
    modules: DiscordBotModule[] = [];

    constructor() {
        this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
        this.client.on("ready", () => {
            console.log(`Logged in as ${this.client.user.tag}!`);
        });

        this.client.on(Events.InteractionCreate, async interaction => {
            if(!interaction.isChatInputCommand()){
                return;
            }

            const { commandName } = interaction;

            this.modules.forEach((module) => {
                module.commands.forEach((command) => {
                    if(command.command.name === commandName){
                        command.execute(interaction);
                        return;
                    }
                });
            });
        })

        this.client.login(process.env.DISCORD_TOKEN);
    }

    registerModule(module: DiscordBotModule) {
        module.discordBot = this;
        this.modules.push(module);
    }

    registerCommands(): void {
        // Construct and prepare an instance of the REST module
        const rest = new REST({ version: "10" }).setToken(
            process.env.DISCORD_TOKEN
        );

        this.modules.forEach((module) => {
            let commandsJson = [];
            // Loop through all the commands and serialize the command to JSON
            module.commands.forEach((command) => {
                commandsJson.push(command.command.toJSON());
            });

            // and deploy your commands!
            (async () => {
                try {
                    console.log(
                        `Started refreshing ${commandsJson.length} application (/) commands.`
                    );

                    // The put method is used to fully refresh all commands in the guild with the current set
                    const data = await rest.put(
                        Routes.applicationGuildCommands(
                            process.env.DISCORD_CLIENT_ID,
                            process.env.DISCORD_GUILD_ID
                        ),
                        { body: commandsJson }
                    );

                    console.log(
                        `Successfully reloaded ${data} application (/) commands.`
                    );
                } catch (error) {
                    // And of course, make sure you catch and log any errors!
                    console.error(error);
                }
            })();
        });
    }

    connect() {}
}

export default DiscordBot;
