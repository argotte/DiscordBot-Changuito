import { REST, Routes, ApplicationCommandOptionType } from "discord.js";
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
      name: "menu",
      description: "Menu del soporte del chango",
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
    },
    {
      name: "userinfo",
      description: "Tu información de usuario",
    },
    {
      name: "kick",
      description: "Expulsa a un usuario",
      options: [
        {
          name: "usuario",
          description: "Usuario a expulsar",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "razon",
          description: "Razón de la expulsión",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "ban",
      description: "Banear a un usuario",
      options: [
        {
          name: "usuario",
          description: "Usuario a banear",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "razon",
          description: "Razón del ban",
          type: ApplicationCommandOptionType.String,
          required: false,
        },
      ],
    },
    {
      name: "mute",
      description: "Mutea a un usuario",
    },
    {
      name: "unmute",
      description: "Desmutea a un usuario",
    },
    {
      name: "play",
      description: "Reproduce de youtube",
      options: [
        {
          name: "url",
          description: "Nombre de la canción",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name:"queue",
      description:"Añade a la cola de reproducción",
      options:[
        {
          name:"url",
          description:"url",
          type:ApplicationCommandOptionType.String,
          required:true
        }
      ]
    },
    {
      name:"next",
      description:"Siguiente canción",
    },
    {
      name:"stop",
      description:"Detiene la reproducción",
    },
    // {
    //   name: "usd",
    //   description: "Convierte de dolares a pesos mexicanos",
    //   options: [
    //     {
    //       name: "cantidad",
    //       description: "Cantidad de dolares",
    //       type: ApplicationCommandOptionType.Number,
    //       required: true,
    //     },
    //   ],
    // },
    // {
    //   name: "mxn",
    //   description: "Convierte de pesos mexicanos a dolares",
    //   options: [
    //     {
    //       name: "cantidad",
    //       description: "Cantidad de pesos mexicanos",
    //       type: ApplicationCommandOptionType.Number,
    //       required: true,
    //     },
    //   ],
    // },
    {
      name:"pause",
      description:"Pausa la reproducción",
    },
    {
      name:"resume",
      description:"Reanuda la reproducción",
    },
    {
      name: "rules",
      description: "Reglas del servidor",
    },
    {
      name: "delete",
      description: "Borra mensajes",
    },
    {
      name: "profilepic",
      description: "Muestra la foto de perfil de un usuario",
      options: [
        {
          name: "target",
          description: "Usuario del que quieres ver la foto de perfil",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
      ],
    },
    {
      name: "emojiinfo",
      description: "Información de un emoji",
      options: [
        {
          name: "emoji",
          description: "Devuelve la manera de usar un emoji con el formato <nombre:ID>",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
    {
      name: "channelinfo",
      description: "Información de un canal",
      options: [
        {
          name: "channel",
          description: "Canal del que quieres ver la información",
          type: ApplicationCommandOptionType.Channel,
          required: true,
        },
      ],
    },
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
