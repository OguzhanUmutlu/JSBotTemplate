let Discord = require("discord.js");
let message = new Discord.Message(new Discord.Client(), {}, new Discord.TextChannel(new Discord.Guild(new Discord.Client(), {}), {}));
// @CONFIG
// @name example
// @description This is an example command
// @aliases test1,test2
// @channelRequirement text
// @channelRequirementMessage Use this command in guild text channel!
// @permissions MANAGE_MESSAGES,MANAGE_GUILD
// @permissionMessage You don't have permission to use this command!
// @idRequirement myId
// @idRequirementMessage You don't have permission to use this command!
// @cooldown 10
// @cooldownMessage Please wait %0 seconds to use this command again!
// @botOwnerRequirement true
// @botOwnerRequirementMessage You don't have permission to use this command!
// @CONFIG END

await message.channel.send("Hello world!");
