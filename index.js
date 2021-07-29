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
    let permissions = ['SERVER_OWNER', 'CREATE_INSTANT_INVITE', 'KICK_MEMBERS', 'BAN_MEMBERS', 'ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'PRIORITY_SPEAKER', 'STREAM', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'VIEW_GUILD_INSIGHTS', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS'];
    if(m.guild && command.permissions.some(i=> !permissions.includes(i))) return message.reply("An error occurred. Error code: #0458");
    if(m.guild && command.permissions.some(perm => perm === "SERVER_OWNER" ? m.guild.ownerID !== m.author.id : !m.member.hasPermission(perm))) return m.channel.send(
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