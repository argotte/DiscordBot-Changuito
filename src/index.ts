import { Client, Message, TextChannel } from "discord.js";
import { config } from 'dotenv';
config();
import * as configjson from './config.json';
class BotDiscord {
  private client: Client;
  private prefix: string = configjson.prefix;
constructor() {
this.client = new Client(
    { intents: ["GuildMessages", "Guilds","MessageContent",
                "GuildPresences","AutoModerationConfiguration","AutoModerationExecution",
                "DirectMessageReactions","DirectMessageTyping","DirectMessages","GuildBans",
                "GuildEmojisAndStickers","GuildIntegrations","GuildInvites","GuildMembers",
                "GuildMessageReactions","GuildMessageTyping","GuildModeration",
                "GuildPresences","GuildScheduledEvents","GuildVoiceStates","GuildWebhooks"] });


    this.client.on("ready",() => {
        console.log(`Bot is ready as: ${this.client.user?.tag}`);
        
    });
    this.client.on("messageCreate", (message: Message) => {
        if (!message.content.startsWith(this.prefix) || message.author.bot) return;
        if (message.content === this.prefix+" hola") {
            message.reply("hola changuito");
        }
    });
}

  public start() {
    this.client.login(
      process.env.TOKEN
    );
  }
}

const bot = new BotDiscord();
bot.start();
