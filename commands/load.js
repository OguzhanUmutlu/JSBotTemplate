let Discord = require("discord.js");
let message = new Discord.Message(new Discord.Client(), {}, new Discord.TextChannel(new Discord.Guild(new Discord.Client(), {}), {}));
let args = [""];
// @CONFIG
// @name load
// @description This command loads the command for current session!
// @idRequirement 460154149040947211
// @CONFIG END

const fs = require("fs");
const Base = require("../Base").getInstance();

if(!args[0]) return message.reply("You should enter command file to load!");

if(!Base.addCommand(args[0])) return message.reply("An error occured.");
await message.reply("Command loaded!")