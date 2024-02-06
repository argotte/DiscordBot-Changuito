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
    this.client.on("ready", () => {
      console.log(`Bot is ready as: ${this.client.user?.tag}`);
          const guild = this.client.guilds.cache.first(); // Replace with the actual guild if needed
          if (guild) {
            // if(!ticketeraChannel)
            guild.members.fetch().then((members) => {
              members.each(async(member) => {
                // Ignore bots
                if (member.user.bot) return;
                const checkChannelExist = await guild.channels.cache.find(
                              (channel) => channel.name === "ticketera"
                            ) as TextChannel;
                if(!checkChannelExist){
                                  console.log(`No existe para ${member.user.username}. Se creara`)
                                  await guild.channels.create({
                                    name: "Ticketera",
                                    type: ChannelType.GuildText,
                                    permissionOverwrites: [
                                      {
                                        id: guild.roles.everyone.id,
                                        deny: [
                                          PermissionsBitField.Flags.ViewChannel,
                                        ], // Deny access to everyone
                                      },
                                      {
                                        id: member.user.id,
                                        allow: [
                                          PermissionsBitField.Flags.ViewChannel,
                                        ], // Allow access to the member
                                      },
                                      {
                                        id: this.client.user?.id ?? "null",
                                        allow: [
                                          PermissionsBitField.Flags.ViewChannel,
                                        ], //allow access to bot
                                      },
                                    ],
                                  });
                }

              });
            });
            //another fetch
            guild.members.fetch().then((members) => {
              members.each(async(member) => {
                // Ignore bots
                if (member.user.bot) return;
                const checkChannelExist = await guild.channels.cache.find(
                              (channel) => channel.name === "ticketera"
                            ) as TextChannel;
                if(checkChannelExist){
                  this.ticketeraSystem(guild); 
                }
              });
            });
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

  private async ticketeraSystem(guild?: Guild) {
  const ticketeraChannel = guild?.channels.cache.find(
    (channel) => channel.name === "ticketera"
  ) as TextChannel;

  if (!ticketeraChannel) {
    console.log("Ticketera channel not found");
    return;
  }

  // Create the initial button
  const createTicketButton =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("Crear Ticket")
        .setStyle(ButtonStyle.Primary)
    );

  // Send the initial button
  ticketeraChannel.send({
    content: "Click the button below to create a ticket.",
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
        components: [ticketButtons],
      });
    } else if (interaction.customId === "comprar") {
      // Create a ticket and notify admins
      // This will depend on how you're handling tickets and notifications
      // For now, just send a message
      await interaction.reply(
        "Se ha notificado con los administradores que deseas comprar. Seras contactado a la brevedad posible."
      );
    } else if (interaction.customId === "support") {
      // Create a ticket and notify admins
      // This will depend on how you're handling tickets and notifications
      // For now, just send a message
      await interaction.reply("Support Ticket Created.");
    }
  });
  }
}
