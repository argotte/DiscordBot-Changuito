"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const configjson = require("./config.json");
class BotDiscord {
    client;
    prefix = configjson.prefix;
    constructor() {
        this.client = new discord_js_1.Client({ intents: ["GuildMessages", "Guilds", "MessageContent",
                "GuildPresences", "AutoModerationConfiguration", "AutoModerationExecution",
                "DirectMessageReactions", "DirectMessageTyping", "DirectMessages", "GuildBans",
                "GuildEmojisAndStickers", "GuildIntegrations", "GuildInvites", "GuildMembers",
                "GuildMessageReactions", "GuildMessageTyping", "GuildModeration",
                "GuildPresences", "GuildScheduledEvents", "GuildVoiceStates", "GuildWebhooks"] });
        this.client.on("ready", () => {
            console.log(`Bot is ready as: ${this.client.user?.tag}`);
        });
        this.client.on("messageCreate", (message) => {
            if (!message.content.startsWith(this.prefix) || message.author.bot)
                return;
            if (message.content === this.prefix + " hola") {
                message.reply("hola changuito");
            }
        });
    }
    start() {
        this.client.login(process.env.TOKEN);
    }
}
const bot = new BotDiscord();
bot.start();
