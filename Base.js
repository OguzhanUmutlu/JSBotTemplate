let instance = null;
const fs = require("fs");
const {getOwnerId} = require("./index");
function errLoadCommand(name, code) {
    console.error("Cannot load " + name + "! Error code: #" + code);
}
function replaceMessageTags(str, m) {
    return str
        .replace(/{author.id}/g, m.author.id)
        .replace(/{author.tag}/g, m.author.tag)
        .replace(/{author.username}/g, m.author.username)
        .replace(/{author.discriminator}/g, m.author.discriminator)
        .replace(/{author.nickname}/g, m.member ? m.member.nickname || "" : "");
}
let cooldowns = {};
let listeners = {};
let onceListeners = {};
module.exports = {
    new: new (class Base {
        constructor() {
            this.resetCommands();
            this.dir = "";
            instance = this;
        }
        cancellableEvent() {
            return new class {
                constructor() {
                    this.setCancelled(false);
                }
                isCancelled() {
                    return this.cancelled;
                }
                setCancelled(value = true) {
                    this.cancelled = value;
                }
            }
        }
        resetCommands() {
            this.commands = [];
        }
        addCommand(fileName) {
            if(fileName === "!CommandEvaller.js") return false;
            const dir = this.dir.replace(/\\/g, "/");
            try {
                let text = fs.readFileSync(dir+"/commands/"+fileName).toString();
                let res = text.split("\n").map(i=> i.replace(/\r/g, "")).filter(i=> i.includes("//")).map(i=> {
                    let index = -1;
                    for(let j=0;j<i.length;j++)
                        if(i.charAt(j) === "/" && i.charAt(j+1) === "/" && index === -1)
                            index = j;
                    return index === -1 ? null : i.split("").slice(index+2).join("");
                }).filter(i=> i);
                res = res.map(i=> {
                    let index = -1;
                    for(let j=0;j<i.length;j++)
                        if(i.charAt(j) !== " " && index === -1)
                            index = j;
                    return index === -1 ? i : i.split("").slice(index).join("");
                }).filter(i=> i);
                let start = Object.keys(res).filter(k=> res[k].replace(/ /g, "") === "@CONFIG")[0]*1;
                if(!start && start !== 0) {
                    errLoadCommand(fileName, 4975);
                    return false;
                }
                let end = Object.keys(res).filter(k=> res[k].replace(/ /g, "") === "@CONFIG"+"END")[0]*1;
                if(!end && end !== 0) {
                    errLoadCommand(fileName, 4754);
                    return false;
                }
                res = res.slice(start+1, end);
                res = res.filter(i=> i.includes("@")).map(i=> {
                    let index = -1;
                    for(let j=0;j<i.length;j++)
                        if(i.charAt(j) === "@" && index === -1)
                            index = j;
                    return index === -1 ? null : i.split("").slice(index+1).join("");
                }).filter(i=> i);
                res = res.filter(i=> i.includes(" ")).map(i=> {
                    return {
                        key: i.split(" ")[0],
                        value: i.split(" ").slice(1).join(" ")
                    };
                });
                let actualEnd = Object.keys(text.split("\n")).filter(k=> text.split("\n")[k].replace(/ /g, "").replace(/\r/g, "") === "//@CONFIG"+"END")[0]*1;
                if(!actualEnd && actualEnd !== 0) {
                    errLoadCommand(fileName, 4754);
                    return false;
                }
                let code = text.split("\n").slice(actualEnd).join("\n");
                let lines = {
                    name: undefined,
                    description: undefined,
                    aliases: [],
                    channelRequirement: "",
                    channelRequirementMessage: "You cannot use this command here!",
                    permissions: [],
                    permissionMessage: "You don't have permission to use this command!",
                    idRequirement: [],
                    idRequirementMessage: "You don't have permission to use this command!",
                    cooldown: 0,
                    cooldownMessage: "Please wait %0 seconds to use this command again!",
                    botOwnerRequirement: "false",
                    botOwnerRequirementMessage: "You don't have permission to use this command!"
                };
                res.forEach(i=> {
                    if(Object.keys(lines).includes(i.key))
                        lines[i.key] = Array.isArray(lines[i.key]) ? i.value.split(",") : i.value;
                });
                lines["execute"] = function(message, args) {
                    let codeEval = `const Base = require("${dir}/index").getBase();const Discord = require("discord.js");let client = require("${dir}/index").getClient();
let message = client.channels.cache.get("${message.channel.id}").messages.cache.get("${message.id}");
let args = ${JSON.stringify(args)};
${code}`;
                    return require(dir+"/commands/!CommandEvaller")(codeEval);
                }
                lines["file"] = fileName;
                if(!lines["name"]) {
                    errLoadCommand(fileName, 7283);
                    return false;
                }
                if(this.commands[lines["name"]]) {
                    errLoadCommand(fileName, 4301);
                    return false;
                }
                this.commands[lines["name"]] = lines;
                return true;
            } catch(e) {
                console.error(e)
                errLoadCommand(fileName, 8754);
            }
        }
        removeCommand(name) {
            delete this.commands[name];
        }
        on(event = "", callable = function(){}){
            if(!listeners[event]) listeners[event] = [];
            listeners[event].push(callable);
        }
        once(event = "", callable = function(){}){
            if(!onceListeners[event]) onceListeners[event] = [];
            onceListeners[event].push(callable);
        }
        emit(event, ...args) {
            (listeners[event] || []).forEach(i=> {
                i(...args);
            });
            (onceListeners[event] || []).forEach((i,j)=> {
                i(...args);
                delete onceListeners[event][j];
            });
        }
        async handleMessage(m, prefix) {
            if (!m.content.startsWith(prefix)) return;
            let arg = m.content.replace(prefix, "").split(" ");
            let cmd = arg[0];
            let args = arg.slice(1);
            let command = Object.values(this.commands).filter(i => {
                return i.name && (
                    i.name.toLowerCase() === cmd.toLowerCase() ||
                    i.aliases.map(i => i.toLowerCase()).includes(cmd.toLowerCase()));
            })[0];
            if (!command) return;
            if (command.channelRequirement && command.channelRequirement !== m.channel.type) return m.channel.send(
                replaceMessageTags(command.channelRequirementMessage, m)
            );
            let permissions = ['SERVER_OWNER', 'CREATE_INSTANT_INVITE', 'KICK_MEMBERS', 'BAN_MEMBERS', 'ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'PRIORITY_SPEAKER', 'STREAM', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'VIEW_GUILD_INSIGHTS', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS'];
            if (m.guild && command.permissions.some(i => !permissions.includes(i))) return m.reply("An error occurred. Error code: #0458");
            if (m.guild && command.permissions.some(perm => perm === "SERVER_OWNER" ? m.guild.ownerID !== m.author.id : !m.member.hasPermission(perm))) return m.channel.send(
                replaceMessageTags(command.permissionMessage, m)
            );
            if (command.idRequirement.length > 0 && !command.idRequirement.includes(m.author.id)) return m.channel.send(
                replaceMessageTags(command.idRequirementMessage, m)
            );
            if (command.cooldown > 0) {
                if (!cooldowns[command.name])
                    cooldowns[command.name] = {};
                if ((cooldowns[command.name][m.author.id] || 0) > Date.now()) return m.channel.send(
                    replaceMessageTags(command.cooldownMessage, m)
                        .replace(/%0/g, Math.floor((cooldowns[command.name][m.author.id] - Date.now()) / 1000))
                );
                cooldowns[command.name][m.author.id] = Date.now() + (command.cooldown * 1000);
            }
            if (command.botOwnerRequirement === "true" && m.author.id !== getOwnerId()) return m.channel.send(
                replaceMessageTags(command.botOwnerRequirementMessage, m)
            );
            let cancel = this.cancellableEvent();
            this.emit("commandExecute", command, m, args, cancel);
            if (!cancel.isCancelled()) {
                let error = await command.execute(m, args);
                if (error instanceof Error) {
                    let file = "/errors/" + command.name + "-" + Date.now() + ".xl";
                    fs.writeFileSync("." + file,
                        `Command: ${JSON.stringify(command)}\n
Executor: ${m.author.tag}(${m.author.id})\n
Message: ${m.content}\n
Error: ${require("util").inspect(error)}`);
                    this.emit("commandError", command, m, args, error, file);
                    console.log("An error occurred while executing " + command.name + ", check error at: " + file);
                    m.reply("Internal Bot Error");
                }
            }
        }
    })(),
    getInstance() {
        return instance;
    }
};
