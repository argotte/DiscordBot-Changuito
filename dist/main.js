"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const register_command_1 = require("./register-command");
const registerCommand = new register_command_1.RegisterCommand();
const bot = new index_1.BotDiscord(registerCommand);
bot.start();
