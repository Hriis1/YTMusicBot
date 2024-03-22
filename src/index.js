require('dotenv').config();

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents, Collection } = require('discord.js');
const { Player } = require('discord-player');

const { IntentsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates
    ]
});
const player = new Player(client);
client.player = player;

client.on('ready', (c) => {
    console.log(`${c.user.username} is online!`);
});

client.on('messageCreate', (msg) => {

    //Dont do anything if the msg is sent by a bot
    if (msg.author.bot) {
        return;
    }

    if (msg.content === 'hello') {
        msg.reply('zdr kopele!');
    }

});

//Event listener for slash commands
client.on('interactionCreate', async (interaction) => {

    //Check if the interaction is not a slash command
    if (!interaction.isChatInputCommand()) return;

    //Check for different commands
    if (interaction.commandName === 'hey') {
        interaction.reply("ko staa kopele!");
    } else if (interaction.commandName === 'addorsubtract') {
        const num1 = interaction.options.get('num1').value;
        const num2 = interaction.options.get('num2').value;

        if (interaction.options.get('operation').value === 'add') {
            interaction.reply(`${num1} + ${num2} = ${num1 + num2}`);
        } else {
            interaction.reply(`${num1} - ${num2} = ${num1 - num2}`);
        }
    } else if (interaction.commandName === 'embed') {
        //Create and fill the embed
        let embed = new EmbedBuilder();
        embed.setTitle("Embed title").setDescription("This is an embed description").setColor('Random')
            .addFields(
                [
                    {
                        name: 'Field 1 title',
                        value: 'Val of field 1'
                    },
                    {
                        name: 'Field 2 title',
                        value: 'Field 2 is an inline',
                        inline: true
                    },
                    {
                        name: 'Field 3 title',
                        value: 'Field 3 is also an inline',
                        inline: true
                    },
                    {
                        name: 'Field 4 title',
                        value: 'Val of field 4'
                    },
                ]
            );

        //Send the embed
        interaction.reply({ embeds: [embed] });
    } else if (interaction.commandName === 'play') {
        //Get the link
        const music = interaction.options.get('music').value;

        // Get the voice channel of the user who triggered the command
        const memberVoiceChannel = interaction.member.voice.channel;

        //Play the music
        try {
            const { track } = await client.player.play(memberVoiceChannel, music, { search: true });
            console.log(`🎉 I am playing ${track.title} 🎉`);
        } catch (error) {
            console.log(`Failed to play error oh no:\n\n${error}`);
        }


        //Tell the channel
        interaction.channel.send(`Playing ${music}`);
    }
});

client.login(process.env.TOKEN);