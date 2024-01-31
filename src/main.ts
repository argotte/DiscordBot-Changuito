import { BotDiscord } from "./index";
import { RegisterCommand } from "./register-command";

const registerCommand = new RegisterCommand();
const bot = new BotDiscord(registerCommand);
bot.start();
