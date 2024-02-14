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
  Collection,
  GuildEmoji,
  VoiceChannel,
  DiscordAPIError,
} from "discord.js";
import { validate, video_basic_info, search, video_info, stream } from "play-dl";
import {
  stream as playdlStream,
  video_basic_info as playdlInfo,
  validate as playdlValidate,
} from "play-dl";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from "@discordjs/voice";

import { config } from "dotenv";
config();
import * as configjson from "./config.json";
import { RegisterCommand } from "./register-command";
export class BotDiscord {
  private client: Client;
  // private member: GuildMember
  private queue = new Map<string, string[]>();
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
        // this.ticketeraSystem();
      }
    });

    this.client.on("messageCreate", (message: Message) => {
      if (!message.content.startsWith(this.prefix) || message.author.bot)
        return;
      if (message.content === this.prefix + " hola") {
        message.reply("hola changuito");
      }
      if (message.content === this.prefix + " puto") {
        message.reply("quieres pedos o que hdtpm?");
      }
      if (message.content === this.prefix + " perdon") {
        message.reply("el changuito te perdona uwu");
      }
      if (message.content === this.prefix + " ataca") {
        message.reply("a quién hay que partirle su madre ???");
      }
    });

    this.client.on("interactionCreate", async (interaction) => {
      console.log("interactionCreatelog");
      if (!interaction.isChatInputCommand()) return;
      const { commandName } = interaction;
      switch (commandName) {
        case "queue":
          const queryToQueue = interaction.options.getString("url");
          if (!queryToQueue) {
            await interaction.reply("Falta la consulta de búsqueda.");
            return;
          }
          const guildIdForQueue = interaction.guild?.id as string;
          if (!guildIdForQueue) {
            await interaction.reply(
              "Este comando solo se puede usar en un servidor."
            );
            return;
          }
          let serverQueueList = this.queue.get(guildIdForQueue) as string[];
          if (!serverQueueList) {
            serverQueueList = [];
            this.queue.set(guildIdForQueue, serverQueueList);
          }

          // Search for the query and get the URL of the first result
          const searchResultsForQueue = await search(queryToQueue);
          const firstResultForQueue = searchResultsForQueue.values().next().value;
          if (!firstResultForQueue) {
            await interaction.reply("No se encontraron resultados.");
            return;
          }
          const urlToQueue = firstResultForQueue.url;

          serverQueueList.push(urlToQueue);
          await interaction.reply(`Añadido a la cola: ${urlToQueue}`);
          break;

        case "play":
          const query = interaction.options.getString("url");
          if (!query) {
            await interaction.reply("Falta la URL del video de YouTube.");
            return;
          }

          const channelVoice = interaction.member as GuildMember;
          const channelVoice2 = channelVoice.voice.channel;
          if (!channelVoice2) {
            await interaction.reply(
              "Debes estar en un canal de voz para reproducir música."
            );
            return;
          }
          const guildId = interaction.guild?.id as string;
          if (!guildId) {
            await interaction.reply(
              "Este comando solo se puede usar en un servidor."
            );
            return;
          }

          let serverQueue = this.queue.get(guildId) as string[];
          if (!serverQueue) {
            serverQueue = [];
            this.queue.set(guildId, serverQueue);
          }

          let url: string;
          const searchResults = await search(query);
          const firstResult = searchResults.values().next().value;
          if (!firstResult) {
            await interaction.reply("No se encontraron resultados.");
            return;
          }
          url = firstResult.url;
          serverQueue.push(url);

          if (serverQueue.length === 1) {
            try {
              const connection = joinVoiceChannel({
                channelId: channelVoice2.id,
                guildId: channelVoice2.guild.id,
                adapterCreator: channelVoice2.guild.voiceAdapterCreator,
              });
              const playSong = async () => {
                const songUrl = serverQueue[0];
                if (!songUrl) {
                  connection.destroy();
                  return;
                }

                const streamData = await stream(songUrl);
                const resource = createAudioResource(streamData.stream, {
                  inputType: streamData.type,
                });
                const player = createAudioPlayer();
                        try {
                          await interaction.followUp(
                            `Reproduciendo: ${songUrl}`
                          );
                        } catch (error) {
                          if (
                            error instanceof DiscordAPIError &&
                            error.code === 10062
                          ) {
                            // La interacción ha expirado, envía el mensaje directamente al canal
                            if (interaction.channel) {
                              interaction.channel.send(
                                `Reproduciendo: ${songUrl}`
                              );
                            }
                          } else {
                            // Se produjo un error diferente, lanza el error para manejarlo en otro lugar
                            throw error;
                          }
                        }
                player.play(resource);
                connection.subscribe(player);

                player.on(AudioPlayerStatus.Idle, () => {
                  serverQueue.shift();
                  playSong();
                });
              };
              playSong();

      try {
        await interaction.reply(`Reproduciendo: ${url}`);
      } catch (error) {
        if (error instanceof DiscordAPIError && error.code === 10062) {
          // La interacción ha expirada, envía el mensaje directamente al canal
          if (interaction.channel) {
            interaction.channel.send(`Reproduciendo: ${url}`);
          }
        } else {
          // Se produjo un error diferente, lanza el error para manejarlo en otro lugar
          throw error;
        }
      }
    } catch (error) {
      console.error(error);
      console.log(error);
      await interaction.followUp("Hubo un error al reproducir el video.");
    }
  } else {
    await interaction.reply(`Añadido a la cola: ${url}`);
  }
  break;
        case "delete":
          const intedelete = interaction.member
            ?.permissions as PermissionsBitField;
          if (intedelete.has(PermissionsBitField.Flags.ManageMessages)) {
            if (!interaction.guild) {
              await interaction.reply(
                "This command can only be used in a server."
              );
              return;
            }
            await interaction.deferReply({ ephemeral: true });
            const messages =
              (await interaction.channel?.messages.fetch()) as Collection<
                string,
                Message
              >;
            const channelDel = interaction.channel as TextChannel;
            await channelDel.bulkDelete(messages);
            await interaction.deleteReply();
          } else {
            await interaction.reply(
              "Escuchame, " +
                interaction.user.username +
                ", no tienes permisos para usar este comando, rufián."
            );
          }
          break;
        case "profilepic":
          const user = interaction.options.getUser("target") as ClientUser;
          if (!user) {
            await interaction.reply("No se ha encontrado el usuario.");
            return;
          }
          await interaction.reply(user?.displayAvatarURL());
          break;

        case "emojiinfo":
          const emojiString = interaction.options.getString("emoji");
          if (!emojiString) {
            await interaction.reply("Falta el emoji.");
            return;
          }

          console.log(emojiString);
          // Extract the emoji ID from the string
          const emojiIdMatch = emojiString.match(/(?<=:)\d+(?=>)/g);
          console.log(emojiIdMatch);
          if (!emojiIdMatch) {
            await interaction.reply("No se pudo extraer el ID del emoji.");
            return;
          }

          const emojiId = emojiIdMatch[0];

          // Get the emoji from the client's emoji cache
          const emoji = this.client.emojis.cache.get(emojiId) as GuildEmoji;

          if (!emoji) {
            await interaction.reply("No se pudo encontrar el emoji.");
            return;
          }

          await interaction.reply(
            `El emoji ${emoji.name} tiene el ID: ${emoji.id}`
          );
          break;
        case "channelinfo":
          const channel = interaction.options.getChannel(
            "channel"
          ) as TextChannel;
          if (!channel) {
            await interaction.reply("Falta el canal.");
            return;
          }
          const embedchannelinfo = new EmbedBuilder()
            .setTitle(`INFORMACIÓN DEL CANAL`)
            .setDescription(`Detalles sobre ${channel.name}`)
            .setColor("Random")
            .addFields(
              { name: "Nombre: ", value: channel.name, inline: true },
              {
                name: "ID: ",
                value: channel.id,
                inline: true,
              },
              {
                name: "Channel Type",
                value: ChannelType.GuildText.toString(),
                inline: true,
              },
              {
                name: "Fecha de creación: ",
                value: channel.createdAt.toDateString(),
                inline: true,
              }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embedchannelinfo] });
          break;
        case "kick":
          const intekick = interaction.member
            ?.permissions as PermissionsBitField;
          if (intekick.has(PermissionsBitField.Flags.KickMembers)) {
            console.log("paso x intekick");
            if (!interaction.guild) {
              await interaction.reply(
                "This command can only be used in a server."
              );
              return;
            }
            const user = interaction.options.getUser("usuario") as ClientUser;
            const reason = interaction.options.getString("razon") as string;
            console.log(reason);
            const memberkick = interaction.guild.members.cache.get(user?.id);
            if (!memberkick) {
              await interaction.reply("El usuario no está en el server");
              return;
            }
            await interaction.reply(
              "El chango ha expulsado al usuario, por la siguiente razón: " +
                reason
            );
            await memberkick.kick(reason);
          } else {
            await interaction.reply(
              "Escuchame, " +
                interaction.user.username +
                ", no tienes permisos para usar este comando, rufián."
            );
          }
          break;
        case "ban":
          const inteban = interaction.member
            ?.permissions as PermissionsBitField;
          if (
            inteban.has([
              PermissionsBitField.Flags.KickMembers,
              PermissionsBitField.Flags.BanMembers,
            ])
          ) {
            if (!interaction.guild) {
              await interaction.reply(
                "This command can only be used in a server."
              );
              return;
            }
            const user = interaction.options.getUser("usuario") as ClientUser;
            const reason = interaction.options.getString("razon") as string;
            const memberban = interaction.guild.members.cache.get(user?.id);
            if (!memberban) {
              await interaction.reply("El usuario no está en el server");
              return;
            }
            await memberban.ban({ reason: reason });
            await interaction.reply(
              "El chango ha baneado al usuario, por la siguiente razón: " +
                reason
            );
          } else {
            await interaction.reply(
              "Escuchame, " +
                interaction.user.username +
                ", no tienes permisos para usar este comando, rufián."
            );
          }
          break;
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
        case "userinfo":
          // Get the member who used the command
          const member = interaction.member as GuildMember;

          // Get the date when the member joined the server
          const joinedAt = member?.joinedAt;

          // Get the age of the member's Discord account
          const accountAge = Date.now() - member.user.createdAt.getTime();

          // Get the member's roles
          const roles = member.roles.cache.map((role) => role.name).join(", ");

          // Reply to the command with the user's information
          await interaction.reply(
            `Changobot informa que te uniste a este server el: ${joinedAt?.toLocaleDateString()}. Tu cuenta de Discord tiene: ${Math.floor(
              accountAge / (1000 * 60 * 60 * 24)
            )} días de existencia. Tus roles en este servidor: ${roles}`
          );
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
    // Send the initial button
    ticketeraChannel.send({
      content: "Dale click para que el chango te cree un ticket.",
      components: [createTicketButton],
    });

    // Event listener for button clicks
    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return;

      if (interaction.customId === "create_ticket") {
        // Create a new button with the label "Creating ticket" and set it to disabled
        await interaction.reply({
          content: "Creando el changoticket...",
          ephemeral: true,
        });

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
