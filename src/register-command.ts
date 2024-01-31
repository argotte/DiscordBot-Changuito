import { REST,Routes } from "discord.js";
import { config } from "dotenv";
config();
export class RegisterCommand {
    private readonly clientID: string = process.env.CLIENT_ID as string;
    private readonly guildID: string = process.env.GUILD_ID as string;
    private readonly token: string = process.env.TOKEN as string;
        commands = [
            {
                name: "ping",
                description: "ChangoPong!",
            },
            {
                name: "hola",
                description: "El chango te saluda",
            },
        ];

  public registerCommands() {
    const rest = new REST({ version: "10" }).setToken(this.token); // Replace 'token' with your bot token

    (async () => {
      try {
        console.log("Started refreshing application (/) commands.");
        await rest.put(Routes.applicationGuildCommands(this.clientID, this.guildID), {
          body: this.commands,
        });

        console.log("Successfully reloaded application (/) commands.");
      } catch (error) {
        console.error(error);
      }
    })();
  }}
