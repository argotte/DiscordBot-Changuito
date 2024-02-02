import { REST,Routes,ApplicationCommandOptionType } from "discord.js";
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
      name: "serverinfo",
      description: "Devuelve información del servidor",
    },
    {
      name: "hola",
      description: "El chango te saluda",
    },
    {
      name: "sumar",
      description: "Asi es, chango sabe sumar",
      options: [
        {
          name: "num1",
          description: "Primer numero",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
        {
          name: "num2",
          description: "Segundo numero",
          type: ApplicationCommandOptionType.Number,
          required: true,
        },
      ],
    },
    {
      name:"menu",
      description:"Menu del soporte del chango",
      // options:[
      //   {
      //     name:"target",
      //     description:"Usuario a banear",
      //     type:ApplicationCommandOptionType.User,
      //     required:true
      //   },
      //   {
      //     name:"reason",
      //     description:"Razón del ban",
      //     type:ApplicationCommandOptionType.String,
      //     required:false
      //   }
      // ]
    }
  ];

  public registerCommands() {
    const rest = new REST({ version: "10" }).setToken(this.token); // Replace 'token' with your bot token

    (async () => {
      try {
        console.log("Started refreshing application (/) commands.");
        await rest.put(
          Routes.applicationGuildCommands(this.clientID, this.guildID),
          {
            body: this.commands,
          }
        );

        console.log("Successfully reloaded application (/) commands.");
      } catch (error) {
        console.error(error);
      }
    })();
  }
}
