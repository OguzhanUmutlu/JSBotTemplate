module.exports = {};
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const request = require("request");
let OWNER_ID = null;
module.exports.getOwnerId = function getOwnerId() {
    return OWNER_ID;
}
const Base = require("./Base").new;
const Utils = require("./utils/Utils");
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

client.once("ready", async () => {
    client.dir = __dirname;
    Base.dir = __dirname;
    let files = fs.readdirSync("./commands/").filter(i=> i.endsWith(".js"));
    files.forEach(i=> Base.addCommand(i));
    OWNER_ID = (await client.fetchApplication()).owner.id;
});

client.on("message", async m => {
    await Base.handleMessage(m, PREFIX);
});

client.login(fs.readFileSync("token.txt").toString()).then(r => r);

module.exports.getClient = function getClient() {
    return client;
}
module.exports.getBase = function getBase() {
    return Base;
}
module.exports.getUtils = function getUtils() {
    return Utils;
}