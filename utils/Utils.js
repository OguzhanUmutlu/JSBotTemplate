const Discord = require("discord.js");
module.exports = {};
module.exports.generateEmbed = (options = {}) => {
    const embed = new Discord.MessageEmbed();
    if(options.author)
        embed.setAuthor(options.author.name, options.author.iconURL,options.author.url);
    if(options.title)
        embed.setTitle(options.title);
    if(options.color) {
        embed.setColor(options.color);
    } else embed.setColor("RANDOM");
    if(options.image)
        embed.setImage(options.image);
    if(options.url)
        embed.setURL(options.url);
    if(options.description)
        embed.setDescription(options.description);
    if(typeof(options.footer) == "string") {
        embed.setFooter(options.footer);
    } else if(typeof(options.footer) == "object")
        embed.setFooter(options.footer.text, options.footer.icon);
    if(options.thumbnail)
        embed.setThumbnail(options.thumbnail);
    if(options.timestamp)
        embed.setTimestamp(options.timestamp);
    (options["fields"] || []).forEach(field => {
        embed.addField(field.title,field.text,field.inline);
    });
    return embed;
}