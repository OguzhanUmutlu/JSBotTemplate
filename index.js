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

function replaceMessageTags(str, m) {
    return str
        .replace(/{author.id}/g, m.author.id)
        .replace(/{author.tag}/g, m.author.tag)
        .replace(/{author.username}/g, m.author.username)
        .replace(/{author.discriminator}/g, m.author.discriminator)
        .replace(/{author.nickname}/g, m.member ? m.member.nickname || "" : "");
}

client.on("message", async m => {
    if(!m.content.startsWith(PREFIX)) return;
    let arg = m.content.replace(PREFIX, "").split(" ");
    let cmd = arg[0];
    let args = arg.slice(1);
    let command = Object.values(Base.commands).filter(i=> {
        return i.name && (
            i.name.toLowerCase() === cmd.toLowerCase() ||
            i.aliases.map(i=> i.toLowerCase()).includes(cmd.toLowerCase()));
    })[0];
    if(!command) return;
    if(command.channelRequirement && command.channelRequirement !== m.channel.type) return m.channel.send(
        replaceMessageTags(command.channelRequirementMessage, m)
    );
    if(m.guild && command.permissions.some(perm=> !m.member.hasPermission(perm))) return m.channel.send(
        replaceMessageTags(command.permissionMessage, m)
    );
    if(command.idRequirement.length > 0 && !command.idRequirement.includes(m.author.id)) return m.channel.send(
        replaceMessageTags(command.idRequirementMessage, m)
    );
    command.execute(m, args);
})

client.login(fs.readFileSync("token.txt").toString()).then(r => r);

module.exports.getClient = function getClient() {
    return client;
}