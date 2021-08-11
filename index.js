module.exports = {};
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const request = require("request");
const Base = require("./Base").new;
const settings = require("./settings.json");
const PREFIX = settings.prefix;

if(settings["update-reminder"]) {
    request("https://raw.githubusercontent.com/OguzhanUmutlu/JSBotTemplate/main/CHANGELOG.json", {method: "GET"}, function (error, response) {
        try {
            const CHANGELOG = JSON.parse(response.body);
            const currentVersion = CHANGELOG[require("./package.json").version];
            if(!currentVersion) {
                console.error("Current version not found in releases! Template might have been updated!");
            } else {
                const lastVersion = Object.values(CHANGELOG)[Object.values(CHANGELOG).length-1];
                if(currentVersion.id < lastVersion.id) {
                    console.log("Template has been updated! You can download and check news in this release: " + lastVersion.release);
                    console.log("New features: " + lastVersion.news.join("\n"));
                } else console.log("You are using latest Template, congratulations!");
            }
        } catch (e) {
            console.error("An error occurred while trying to check updates.");
        }
    });
}

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

client.on("ready", async () => {
    client.dir = __dirname;
    Base.dir = __dirname;
    let files = fs.readdirSync("./commands/").filter(i=> i.endsWith(".js"));
    files.forEach(i=> Base.addCommand(i));
})

client.on("message", async m => {
    Base.handleMessage(m, PREFIX);
})

client.login(fs.readFileSync("token.txt").toString()).then(r => r);

module.exports.getClient = function getClient() {
    return client;
}
module.exports.getBase = function getBase() {
    return Base;
}