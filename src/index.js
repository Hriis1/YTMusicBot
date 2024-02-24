const {Client, IntentsBitField} = require('discord.js');

const token = "MTIxMDg5OTc0OTUxMTYzNDk2NA.GNfuff.oBdu2OFgaLuz8h31kTojsmC7oTK61JE3F44u4U";

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.login(token);