"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterCommand = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// ARREGLA ESTOOOOO
class RegisterCommand {
    clientID = process.env.CLIENT_ID;
    guildID = process.env.GUILD_ID;
    token = process.env.TOKEN;
    // public async registerCommand() {
    commands = [
        {
            name: "ping",
            description: "ChangoPong!",
        },
        {
            name: "hola",
            description: "El chango te saluda",
        },
    ];
    registerCommands() {
        const rest = new discord_js_1.REST({ version: "10" }).setToken(this.token); // Replace 'token' with your bot token
        (async () => {
            try {
                console.log("Started refreshing application (/) commands.");
                await rest.put(discord_js_1.Routes.applicationGuildCommands(this.clientID, this.guildID), {
                    body: this.commands,
                });
                console.log("Successfully reloaded application (/) commands.");
            }
            catch (error) {
                console.error(error);
            }
        })();
    }
}
exports.RegisterCommand = RegisterCommand;
//     try {
//         console.log('Started refreshing application (/) commands.');
//         await rest.put(
//             Routes.applicationGuildCommands(this.clientID, this.guildID),
//             { body: [
//                 {
//                     name: 'Hola',
//                     description: 'El chango saluda!'
//                 },
//                 {
//                     name: 'ping',
//                     description: 'Replies with Pong!'
//                 }
//             ] },
//         );
//     } catch (error) {
//         console.error(error);
//     }
// }
// }