require('dotenv').config();
const { REST, Routes } = require('discord.js');


//The commands that should be registered
const commands = [
    {
        name: 'hey',
        description: 'Replies with hey!'
    },
    {
        name: 'kopr',
        description: "kazva si"
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