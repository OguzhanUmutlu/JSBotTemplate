let Discord = require("discord.js");
let message = new Discord.Message(new Discord.Client(), {}, new Discord.TextChannel(new Discord.Guild(new Discord.Client(), {}), {}));
// @CONFIG
// @name reload
// @description This command reloads the codes in your commands to bot!
// @idRequirement 460154149040947211
// @CONFIG END

const fs = require("fs");
const Base = require("../Base").getInstance();

Base.resetCommands();
fs.readdirSync("./commands").filter(i=> i.endsWith(".js")).forEach(i=> Base.addCommand(i));
message.reply("Commands are reloaded!")