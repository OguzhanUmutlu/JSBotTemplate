let message;
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
// @CONFIG END

message.channel.send("Hello world!");
