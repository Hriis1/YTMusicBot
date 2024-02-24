require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', (c) => {
    console.log(`${c.user.username} is online!`);
});

client.on('messageCreate', (msg) => {

    //Dont do anything if the msg is sent by a bot
    if(msg.author.bot)
    {
        return;
    }

    if(msg.content === 'hello') {
        msg.reply('zdr kopele!');
    }
});

//Event listener for slash commands
client.on('interactionCreate', (interaction) =>
{
    //Check if the interaction is a slash command
    if(!interaction.isChatInputCommand()) return;

    //Check for different commands
    if(interaction.commandName === 'hey')
    {
        interaction.reply("ko staa kopele!");
    }
});

client.login(process.env.TOKEN);