require('dotenv').config();

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents, Collection } = require('discord.js');
const { Player, QueryType } = require('discord-player');

const { IntentsBitField, EmbedBuilder } = require('discord.js');

//node packages
const fs = require("node:fs");
const path = require("node:path");

//variables
var queue;

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildVoiceStates
    ]
});

//Init the player
const player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});
player.extractors.loadDefault();
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
        const userInput = interaction.options.get('music').value;

        // Get the voice channel of the user who triggered the command
        const memberVoiceChannel = interaction.member.voice.channel;

        //Create a queue
        try {
            // Await the creation of the queue
            if (queue == undefined) {
                queue = await client.player.nodes.create(interaction.guildId);
            }

            if (!queue.connection) await queue.connect(memberVoiceChannel);

            const result = await client.player.search(userInput, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            });

            if (result.tracks.length === 0) {
                interaction.reply("No results found");
                return;
            }


            const song = result.tracks[0];

            if (queue.isPlaying()) {
                //if a song is already plaing
                await queue.addTrack(song);
                interaction.reply("Added: " + song.title + " to the queue!");
            } else {
                //if there is no song playing
                await queue.play(song);
                interaction.reply("Playing: " + song.title);
            }


            console.log(queue.size);


        } catch (error) {
            console.error("Error occurred while creating or playing the queue:", error);
            interaction.reply("An error occurred while processing your request.");
        }
    } else if (interaction.commandName === 'skip') {

        if (queue === undefined) {
            interaction.reply("Queue not yet created. Nothing to skip!");
        } else if (queue.isPlaying()) {
            if (queue.size != 0) {
                //If there is another song in the queue
                await queue.node.skip();
                interaction.reply("Skipped the current song!");
            } else {
                //If this is the last playing song
                queue.delete();
                queue = undefined;
                interaction.reply("Skipped the current song! No more songs to play!");
            }
        }
        //interaction.reply("Skipping");
    }
});

client.login(process.env.TOKEN);