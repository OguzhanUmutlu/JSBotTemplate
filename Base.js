let instance = null;
const fs = require("fs");
function errLoadCommand(name, code) {
    console.error("Cannot load " + name + "! Error code: #" + code);
}
module.exports = {
    new: new (class Base {
        constructor() {
            this.resetCommands();
            this.dir = "";
            instance = this;
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
                    let codeEval = `let client = require("${dir}/index").getClient();
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
    })(),
    getInstance: function(){return instance;}
};
