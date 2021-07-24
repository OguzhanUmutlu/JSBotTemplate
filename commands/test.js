// @CONFIG
// @name test
// @description Test komudu
// @aliases test1,test2
// @channelRequirement dm
// @permissions MANAGE_MESSAGES,MANAGE_GUILD
// @idRequirement 460154149040947211
// @CONFIG END

exports = function(data) {
    let { message } = data;
    message.channel.send("Sa");
}