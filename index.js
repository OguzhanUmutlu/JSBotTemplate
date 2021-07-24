const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const wio = require("wio.db");
const db = new wio.JsonDatabase();
const Base = require("./Base").new;
const PREFIX = "!";

client.on("ready", async () => {
    let files = fs.readdirSync("./commands/").filter(i=> i.endsWith(".js"));
    files.forEach(i=> Base.addCommand(i));
})

client.on("message", async m => {
    let arg = m.content.replace(PREFIX, "").split(" ");
    let cmd = arg[0];
    let args = arg.slice(1);
    let command = Base.commands.filter(i=> {
        return i.name && (
            i.name.toLowerCase() === cmd.toLowerCase() ||
            i.aliases.map(i=> i.toLowerCase()).includes(cmd.toLowerCase())) &&
            (!i.channelRequirement || i.channelRequirement === m.channel.type) &&
            (!m.guild || !i.permissions.some(perm=> !m.member.hasPermission(perm))) &&
            i.idRequirement.includes(m.author.id);
    })[0];
    if(!command) return;
    command.execute(m, args);
})

client.login(fs.readFileSync("token.txt").toString()).then(r => r);