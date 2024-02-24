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

/* client.on('messageCreate', (msg) => {
    console.log(`${msg.member.displayName}: ${msg.content}`);
}); */

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

client.login(process.env.TOKEN);ZZ