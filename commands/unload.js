let Discord = require("discord.js");
let message = new Discord.Message(new Discord.Client(), {}, new Discord.TextChannel(new Discord.Guild(new Discord.Client(), {}), {}));
let args = [""];
const Base = require("../Base").getInstance();
// @CONFIG
// @name unload
// @description This command unloads the command for current session!
// @botOwnerRequirement true
// @CONFIG END

if(!args[0]) return message.reply("You should enter command name to unload!");
if(!Base.commands[args[0]]) return message.reply("Command not found!");

Base.removeCommand(args[0]);
await message.reply("Command is unloaded!");