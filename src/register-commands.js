require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');


//The commands that should be registered
const commands = [
    {
        name: 'hey',
        description: 'Replies with hey!'
    },
    {
        name: 'addorsubtract',
        description: 'Adds or subracts 2 numbers',
        options: [
            {
                name: 'operation',
                description: 'The operation to be executed',
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: 'add',
                        value: 'add'
                    },
                    {
                        name: 'subract',
                        value: 'subract'
                    }
                ],
                required: true
            },
            {
                name: 'num1',
                description: 'First number',
                type: ApplicationCommandOptionType.Number,
                required: true
            },
            {
                name: 'num2',
                description: 'Second number',
                type: ApplicationCommandOptionType.Number,
                required: true
            },
        ]
    },
    {
        name: "play",
        description: "Plays music",
        options: [
            {
                name: 'music',
                description: 'Music to play',
                type: ApplicationCommandOptionType.String,
                required: true
            },
        ]
    },
    {
        name: 'skip',
        description: 'Skips the first song in the queue!'
    },
    {
        name: 'clear',
        description: 'Clears the whole queue!'
    },
    {
        name: 'kill',
        description: 'Clears the whole queue and stops the currently playing song!'
    },
    {
        name: 'queue',
        description: 'Shows the songs in the queue!'
    },
    {
        name: 'embed',
        description: 'Sends an embed!'
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID),
            {
                body: commands
            }
        )

        console.log("Slash commands registered sucessfully!");
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();