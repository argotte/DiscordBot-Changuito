"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotDiscord = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const configjson = require("./config.json");
const register_command_1 = require("./register-command");
class BotDiscord {
    client;
    prefix = configjson.prefix;
    registerCommand = new register_command_1.RegisterCommand();
    constructor(registerCommmand = new register_command_1.RegisterCommand()) {
        this.client = new discord_js_1.Client({ intents: [discord_js_1.IntentsBitField.Flags.Guilds,
                "GuildMessages", "Guilds", "MessageContent",
                "GuildPresences", "AutoModerationConfiguration", "AutoModerationExecution",
                "DirectMessageReactions", "DirectMessageTyping", "DirectMessages", "GuildBans",
                "GuildEmojisAndStickers", "GuildIntegrations", "GuildInvites", "GuildMembers",
                "GuildMessageReactions", "GuildMessageTyping", "GuildModeration",
                "GuildPresences", "GuildScheduledEvents", "GuildVoiceStates", "GuildWebhooks"]
        });
        this.registerCommand = registerCommmand;
        this.registerCommand.registerCommands();
        this.setupEventHandlers();
    }
    start() {
        this.client.login(process.env.TOKEN);
    }
    setupEventHandlers() {
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
        this.client.on("interactionCreate", async (interaction) => {
            console.log("interactionCreatelog");
            if (!interaction.isChatInputCommand())
                return;
            const { commandName } = interaction;
            switch (commandName) {
                case "ping":
                    await interaction.reply("changopong");
                    break;
                case "hola":
                    await interaction.reply("Hola chango");
                    break;
                case "sumar":
                    if (!interaction.options.get("num1") || !interaction.options.get("num2")) {
                        await interaction.reply("Faltan parámetros");
                        return;
                    }
                    const num1 = interaction.options.get("num1")?.value;
                    const num2 = interaction.options.get("num2")?.value;
                    await interaction.reply(`La changosuma es: ${num1 + num2}`);
                    break;
            }
        });
    }
}
exports.BotDiscord = BotDiscord;
