import {
  EmbedBuilder,
  IntentsBitField,
  Message,
  TextChannel,
  Client,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
  ChannelType,
  PermissionsBitField,
  Guild,
  GuildMember,
  ClientUser,
} from "discord.js";
import { config } from "dotenv";
config();
import * as configjson from "./config.json";
import { RegisterCommand } from "./register-command";
export class BotDiscord {
  private client: Client;
  // private member: GuildMember
  private prefix: string = configjson.prefix;
  private registerCommand: RegisterCommand = new RegisterCommand();
  constructor(
    registerCommmand = new RegisterCommand()
    // member:GuildMember
  ) {
    this.client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
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
        IntentsBitField.Flags.MessageContent,
      ],
    });
    this.registerCommand = registerCommmand;
    this.registerCommand.registerCommands();
    this.setupEventHandlers();
    // this.member = member;
  }

  public start() {
    this.client.login(process.env.TOKEN);
  }
  
  private setupEventHandlers() {
    this.client.on("ready", async () => {
      console.log(`Bot is ready as: ${this.client.user?.tag}`);
          const guild = this.client.guilds.cache.first(); // Replace with the actual guild if needed
          if (guild) {
            await guild?.channels.fetch();
              let ticketeraChannel = guild.channels.cache.find(
                (channel) => channel.name === "changoticket"
              ) as TextChannel;
              if (!ticketeraChannel) {
                await guild.channels.create({
                  name: "changoticket",
                  type: ChannelType.GuildText,
                  permissionOverwrites: [
                    {
                      id: guild.roles.everyone.id,
                      deny: [PermissionsBitField.Flags.SendMessages], // No one can send messages
                    },
                  ],
                });
              }
              this.ticketeraSystem();
          }
    });

    this.client.on("messageCreate", (message: Message) => {
      if (!message.content.startsWith(this.prefix) || message.author.bot)
        return;
      if (message.content === this.prefix + " hola") {
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
        case "menu":
          const target = interaction.user;
          const compras = new ButtonBuilder()
            .setCustomId("compras")
            .setLabel("Compras")
            .setStyle(ButtonStyle.Danger);

          const support = new ButtonBuilder()
            .setCustomId("support")
            .setLabel("Support")
            .setStyle(ButtonStyle.Secondary);

          const buttonRow =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
              compras,
              support
            );

          await interaction.reply({
            content: `Hola, ${target}. En qué te puede ayudar el chango?`,
            components: [buttonRow],
          });
          break;

      
      }
    });
  }

  private async ticketeraSystem() {
   const guild = this.client.guilds.cache.first();
      await guild?.channels.fetch();
    const ticketeraChannel = guild?.channels.cache.find(
      (channel) => channel.name === "changoticket"
    ) as TextChannel;

    if (!ticketeraChannel) {
      console.log("ChangoTicket channel not found");
      return;
    }
    // // Delete the messages
    // await ticketeraChannel.bulkDelete(messages);

    // Create the initial button
    const createTicketButton =
      new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("create_ticket")
          .setLabel("Crear Ticket")
          .setStyle(ButtonStyle.Primary)
      );
        //the fetch 

      // for(const channel of guild?.channels.cache.values() ?? []){
      //   if (channel.name=="ticketera") {
      //     const ticketeraChannel = channel as TextChannel;
      //           ticketeraChannel.send({
      //   content: "Click the button below to create a ticket.",
      //   components: [createTicketButton],
      // });
      // }}
      // Send the initial button
      ticketeraChannel.send({
        content: "Dale click para que el chango te cree un ticket.",
        components: [createTicketButton],
      });

    // Event listener for button clicks
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return;

      if (interaction.customId === "create_ticket") {
        // Create the "Comprar" and "Support" buttons
        const ticketButtons =
          new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId("comprar")
              .setLabel("Comprar")
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId("support")
              .setLabel("Support")
              .setStyle(ButtonStyle.Secondary)
          );

        // Send the "Comprar" and "Support" buttons
        await interaction.reply({
          content: "Elige una opción.",
          ephemeral: true,
          components: [ticketButtons],
        });
      } else if (interaction.customId === "comprar") {
        // Create a ticket and notify admins
        // This will depend on how you're handling tickets and notifications
        // For now, just send a message
            await interaction.reply({
              content:
                "Se ha notificado a los administradores que deseas comprar. Serás contactado a la brevedad posible.",
              ephemeral: true,
            });
      } else if (interaction.customId === "support") {
            await interaction.reply({
              content:
                "Se ha notificado a los administradores que deseas soporte. Serás contactado a la brevedad posible.",
              ephemeral: true,
            });
      }
    });
  }
}
