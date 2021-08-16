let Discord = require("discord.js");
let message = new Discord.Message(new Discord.Client(), {}, new Discord.TextChannel(new Discord.Guild(new Discord.Client(), {}), {}));
const Base = require("../Base").getInstance();
// @CONFIG
// @name reload
// @description This command reloads the codes in your commands to bot!
// @botOwnerRequirement true
// @CONFIG END

const fs = require("fs");

Base.resetCommands();
fs.readdirSync("./commands").filter(i=> i.endsWith(".js")).forEach(i=> Base.addCommand(i));
await message.reply("Commands are reloaded!");