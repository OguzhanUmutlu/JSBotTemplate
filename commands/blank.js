let Discord = require("discord.js");
let message = new Discord.Message(new Discord.Client(), {}, new Discord.TextChannel(new Discord.Guild(new Discord.Client(), {}), {}));
// @CONFIG
// @name blankCommand
// @CONFIG END

await message.channel.send("Hello its blank command everyone can use!");