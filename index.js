const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const wio = require("wio.db");
const db = new wio.JsonDatabase();
const Base = require("./Base").new;

client.on("ready", async () => {
    let files = fs.readdirSync("./commands/").filter(i=> i.endsWith(".js"));
    files.forEach(i=> Base.addCommand(i));
})

client.login(fs.readFileSync("token.txt").toString()).then(r => r);