let instance = null;
const fs = require("fs");
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
                    this.cancelled = false;
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
                let text = fs.readFileSync(dir+"/commands/"+fileName).toString().split("\n").map(i=> {
                    if(!i.startsWith("// ")) return i;
                    let end = null;
                    for(let a=0;a<i.length;a++) {
                        if(!end && a > 1) {
                            if(i.split("")[a] !== " ")
                                end = a;
                            else i = i.replace(" ", "");
                        }
                    }
                    return i;
                }).join("\n");
                if(!text.includes("//@CONFIG")) {
                    errLoadCommand(fileName, 4975);
                    return false;
                }
                let endLine;
                text.split("\n").forEach((val, key) => {
                    if(val === "//@CONFIG END\r")
                        endLine = key;
                });
                if(endLine === undefined) {
                    errLoadCommand(fileName, 4754);
                    return false;
                }
                let code = text.split("\n").slice(endLine+1).join("\n");
                text = text.split("\n").slice(0, endLine);
                let linesFix = text.filter(i=> i.startsWith("//")).map(i=> {
                    let a = i.replace("//", "").split(" ");
                    return {
                        key: a[0].replace("@", ""),
                        value: a[1] ? a.slice(1).join(" ").replace(/\r/g, "") : undefined
                    };
                });
                let lines = {
                    name: undefined,
                    description: undefined,
                    aliases: [],
                    channelRequirement: "",
                    channelRequirementMessage: "You cannot use this command here!",
                    permissions: [],
                    permissionMessage: "You don't have permission to use this command!",
                    idRequirement: [],
                    idRequirementMessage: "You don't have permission to use this command!"
                };
                linesFix.forEach(i=> {
                    if(Object.keys(lines).includes(i.key))
                        lines[i.key] = Array.isArray(lines[i.key]) ? i.value.split(",") : i.value;
                });
                lines["execute"] = function(message, args) {
                    let codeEval = `const Base = require("${dir}/index").getBase();const Discord = require("discord.js");let client = require("${dir}/index").getClient();
let message = client.channels.cache.get("${message.channel.id}").messages.cache.get("${message.id}");
let args = ${JSON.stringify(args)};
${code}`;
                    require(dir+"/commands/!CommandEvaller")(codeEval);
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
                delete onceListeners[j];
            });
        }
        handleMessage(m, prefix) {
            if(!m.content.startsWith(prefix)) return;
            let arg = m.content.replace(prefix, "").split(" ");
            let cmd = arg[0];
            let args = arg.slice(1);
            let command = Object.values(this.commands).filter(i=> {
                return i.name && (
                    i.name.toLowerCase() === cmd.toLowerCase() ||
                    i.aliases.map(i=> i.toLowerCase()).includes(cmd.toLowerCase()));
            })[0];
            if(!command) return;
            if(command.channelRequirement && command.channelRequirement !== m.channel.type) return m.channel.send(
                replaceMessageTags(command.channelRequirementMessage, m)
            );
            let permissions = ['SERVER_OWNER', 'CREATE_INSTANT_INVITE', 'KICK_MEMBERS', 'BAN_MEMBERS', 'ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'PRIORITY_SPEAKER', 'STREAM', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'VIEW_GUILD_INSIGHTS', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS'];
            if(m.guild && command.permissions.some(i=> !permissions.includes(i))) return m.reply("An error occurred. Error code: #0458");
            if(m.guild && command.permissions.some(perm => perm === "SERVER_OWNER" ? m.guild.ownerID !== m.author.id : !m.member.hasPermission(perm))) return m.channel.send(
                replaceMessageTags(command.permissionMessage, m)
            );
            if(command.idRequirement.length > 0 && !command.idRequirement.includes(m.author.id)) return m.channel.send(
                replaceMessageTags(command.idRequirementMessage, m)
            );
            try {
                let cancel = this.cancellableEvent();
                this.emit("commandExecute", command, m, args, cancel);
                if(!cancel.isCancelled())
                    command.execute(m, args);
            } catch(e) {
                let file = "/errors/"+command.name+"-"+Date.now()+".xl";
                fs.writeFileSync("." + file,
`Command: ${JSON.stringify(command)}\n
Executor: ${m.author.tag}(${m.author.id})\n
Message: ${m.content}\n
Error: ${e}`);
                this.emit("commandError", command, m, args, e, file);
                console.log("An error occurred while executing "+command.name+", check error at: " + file);
            }
        }
    })(),
    getInstance() {
        return instance;
    }
};
