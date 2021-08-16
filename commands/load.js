let Discord = require("discord.js");
let message = new Discord.Message(new Discord.Client(), {}, new Discord.TextChannel(new Discord.Guild(new Discord.Client(), {}), {}));
let args = [""];
const Base = require("../Base").getInstance();
// @CONFIG
// @name load
// @description This command loads the command for current session!
// @botOwnerRequirement true
// @CONFIG END

if(!args[0]) return message.reply("You should enter command file to load!");

if(!Base.addCommand(args[0])) return message.reply("An error occurred.");
await message.reply("Command loaded!");