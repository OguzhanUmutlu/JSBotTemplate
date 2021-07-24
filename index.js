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
    let files = fs.readdirSync("./commands/").filter(i=> i.endsWith(".js"));
    files.forEach(i=> Base.addCommand(i));
})

client.on("message", async m => {
    if(!m.content.startsWith(PREFIX)) return;
    let arg = m.content.replace(PREFIX, "").split(" ");
    let cmd = arg[0];
    let args = arg.slice(1);
    let command = Object.values(Base.commands).filter(i=> {
        return i.name && (
            i.name.toLowerCase() === cmd.toLowerCase() ||
            i.aliases.map(i=> i.toLowerCase()).includes(cmd.toLowerCase())) &&
            (!i.channelRequirement || i.channelRequirement === m.channel.type) &&
            (!m.guild || !i.permissions.some(perm=> !m.member.hasPermission(perm))) &&
            (i.idRequirement.length < 1 || i.idRequirement.includes(m.author.id));
    })[0];
    if(!command) return;
    command.execute(m, args);
})

client.login(fs.readFileSync("token.txt").toString()).then(r => r);

module.exports.getClient = function getClient() {
    return client;
}