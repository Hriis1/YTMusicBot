require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');


//The commands that should be registered
const commands = [
    {
        name: 'Hey',
        description: 'Replies with hey!'
    },
    {
        name: 'AddOrSubtract',
        description: 'Adds or subtracts 2 numbers',
        options: [
            {
                name: 'operation',
                description: 'The operation to be executed',
                type: ApplicationCommandOptionType.String,
                choises: [
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
            }
        ]
    }
];

const rest = new REST({version : '10'}).setToken(process.env.TOKEN);


(async() =>
{
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