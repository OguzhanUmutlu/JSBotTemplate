let instance = null;
const fs = require("fs");
function errLoadCommand(name) {
    console.error("Cannot load "+name+"!");
}
module.exports = {
    new: new (class Base {
        constructor() {
            this.commands = [];
            instance = this;
        }
        addCommand(fileName) {
            try {
                let execute = require("./commands/"+fileName);
                let text = fs.readFileSync("./commands/"+fileName).toString().replace(/ /g, "");
                if(!text.includes("//@CONFIG") || typeof(execute) !== "function") {
                    errLoadCommand(fileName);
                    return;
                }
                let endLine;
                text.split("\n").forEach((val, key) => {
                    if(val === "//@ENDCONFIG") {
                        endLine = key;
                    }
                });
                if(endLine === undefined) {
                    errLoadCommand(fileName);
                    return;
                }
                let linesFix = text.split("\n").filter(i=> i.startsWith("//")).map(i=> {
                    let a = i.replace("//", "").split(" ");
                    return {
                        key: a[0].replace("@", ""),
                        value: a.slice(1).join(" ")
                    };
                });
                let lines = {
                    name: undefined,
                    description: undefined,
                    aliases: [],
                    channelRequirement: "",
                    permissions: [],
                    idRequirement: []
                };
                linesFix.forEach(i=> {
                    if(Object.keys(lines).includes(i.key))
                        lines[i.key] = Array.isArray(lines[i.key]) ? i.value.split(",") : i.value;
                });
                lines["execute"] = function(message, args) {
                    execute({message, args});
                }
                if(!lines["name"]) {
                    errLoadCommand(fileName);
                    return;
                }
                this.commands[lines["name"]] = lines;
            } catch(e) {
                errLoadCommand(fileName);
            }
        }
    })(),
    getInstance: function(){return instance;}
};
