const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const wio = require("wio.db");
const db = new wio.JsonDatabase();



client.login(fs.readFileSync("token.txt").toString()).then(r => r);