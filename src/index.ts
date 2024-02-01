import { EmbedBuilder, IntentsBitField, Message, TextChannel, Client } from "discord.js";
import { config } from 'dotenv';
config();
import * as configjson from './config.json';
import { RegisterCommand } from "./register-command";
export class BotDiscord {
  private client: Client;
  private prefix: string = configjson.prefix;
  private registerCommand: RegisterCommand = new RegisterCommand();
constructor(registerCommmand = new RegisterCommand()) {
  this.client = new Client(
              { intents: [IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.GuildMessageTyping,
                IntentsBitField.Flags.GuildPresences,
                IntentsBitField.Flags.GuildVoiceStates,
                IntentsBitField.Flags.GuildWebhooks,
                IntentsBitField.Flags.GuildEmojisAndStickers,
                IntentsBitField.Flags.GuildIntegrations,
                IntentsBitField.Flags.GuildInvites,
                IntentsBitField.Flags.GuildScheduledEvents,
                IntentsBitField.Flags.DirectMessages,
                IntentsBitField.Flags.DirectMessageReactions,
                IntentsBitField.Flags.DirectMessageTyping,
                IntentsBitField.Flags.GuildModeration,
                IntentsBitField.Flags.AutoModerationConfiguration,
                "GuildMessages", "Guilds","MessageContent",
                "GuildPresences","AutoModerationConfiguration","AutoModerationExecution",
                "DirectMessageReactions","DirectMessageTyping","DirectMessages","GuildBans",
                "GuildEmojisAndStickers","GuildIntegrations","GuildInvites","GuildMembers",
                "GuildMessageReactions","GuildMessageTyping","GuildModeration",
                "GuildPresences","GuildScheduledEvents","GuildVoiceStates","GuildWebhooks"] 
              });
    this.registerCommand = registerCommmand;
    this.registerCommand.registerCommands();
    this.setupEventHandlers();
}

  public start() {
    this.client.login(
      process.env.TOKEN
    );
  }

  private setupEventHandlers() {
        this.client.on("ready", () => {
          console.log(`Bot is ready as: ${this.client.user?.tag}`);
        });
        
        this.client.on("messageCreate", (message: Message) => {
          if (!message.content.startsWith(this.prefix) || message.author.bot) return;
          if (message.content === this.prefix+" hola") {
              message.reply("hola changuito");
          }
        });

        this.client.on("interactionCreate", async (interaction) => {
          console.log("interactionCreatelog");
          if (!interaction.isChatInputCommand()) return;
          const { commandName } = interaction;
          switch (commandName) {
            case "ping":
              await interaction.reply("changopong");
              break;
            case "hola":
              await interaction.reply("Hola chango");
              break;
            case "sumar":
              if (
                !interaction.options.get("num1") ||
                !interaction.options.get("num2")
              ) {
                await interaction.reply("Faltan parámetros");
                return;
              }
              const num1 = interaction.options.get("num1")?.value as number;
              const num2 = interaction.options.get("num2")?.value as number;
              await interaction.reply(`La changosuma es: ${num1 + num2}`);
              break;
            case "serverinfo":
              const { guild } = interaction;

              if (!guild) {
                await interaction.reply(
                  "This command can only be used in a server."
                );
                return;
              }

              const embed = new EmbedBuilder()
                .setTitle(`INFORMACIÓN DEL SERVIDOR`)
                .setDescription(`Detalles sobre ${guild.name}`)
                .setColor("Random")
                .addFields(
                  { name: "Server: ", value: guild.name, inline: true },
                  {
                    name: "Cantidad de miembros:",
                    value: guild.memberCount.toString(),
                    inline: true,
                  },
                  {
                    name: "Cantidad de Roles:",
                    value: guild.roles.cache.size.toString(),
                    inline: true,
                  },
                  {
                    name: "Fecha de creación:",
                    value: guild.createdAt.toDateString(),
                    inline: true,
                  }
                )
                .setTimestamp();

              await interaction.reply({ embeds: [embed] });
              break;
          
            // case "menu":
            //   const menu = new MessageActionRow()
            //   break;
              
          }
        });


  }

}
