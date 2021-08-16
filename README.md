# JSBotTemplate
Discord.JS template

# Usage

- Create token.txt and fill with your bot's token!

- **You are ready lets code!**

# Error Codes

- \#4975: No `@CONFIG` found
- \#4754: No `@CONFIG END` found
- \#7283: No `@name` found
- \#4301: This command already exists
- \#8754: Command internal error
- \#0458: Some command's permission is invalid.

# Todos

- https://tinyurl.com/ExampleErrors fix these
- Functions.js to use them in commands and command permission messages etc.

# Features

- Code without any effort
- Easy command templates
- Return statements!
- Default load, unload and reload commands!
- Error codes!
- No bot crashes!
- Custom events!
- Async commands!
- New IDE syntax supports!
- Update reminder and changelog API!
- Cooldowns!
- New config compiler!

# Custom Events

### What is event?

- They can use events to do things when some thing happens.

### How to create event?

- Just simply use the code below this line and execute all added listeners to this event!

```js
Base.emit("myEvent", arg1, arg2);
```

### How to add listener to an event?

- Example:
```js
Base.on("myEvent", (arg1, arg2) => {
    console.log(arg1, arg2);
});
```

### How to add listener to an event to happen once?

- Example:
```js
Base.once("myEvent", (arg1, arg2) => {
    console.log(arg1, arg2);
});
```

### What are the default events?

All events' examples:

```js
Base.on("commandExecute", async (command, message, args, cancel) => {
    if(command.name === "bannedCommand") {
        cancel.setCancelled();
        message.reply("You cannot use this command!");
    }
    if(args.includes("bannedArgument")) {
        cancel.setCancelled();
        message.reply("An argument in your command is banned!");
    }
})
```

```js
Base.on("commandError", async (command, message, args, error, file) => {
    message.reply("An error occurred!");
    if(message.author.id === "myId") {
        message.channel.send("Saved to file: " + file + "\n" + error, {
            code: "xl",
            split: true
        });
    }
})
```
