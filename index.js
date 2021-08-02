const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const wio = require("wio.db");
const db = new wio.JsonDatabase({
    databasePath: "data.json"
});
const Base = require("./Base").new;
const PREFIX = "!";
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