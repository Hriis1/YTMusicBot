require('dotenv').config();

const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents, Collection } = require('discord.js');
const { Player, QueryType } = require('discord-player');

const { IntentsBitField, EmbedBuilder } = require('discord.js');

//node packages
const fs = require("node:fs");
const path = require("node:path");

//My files
const utils = require('./utils');
const { isYoutubePlaylistURL } = require('youtube-ext/dist/utils');

//variables
var queue;
var songBuffer = [];

//functions
async function playSong(queue, song, interaction) {

    // Get the voice channel of the user who triggered the command and connect to it
    const memberVoiceChannel = interaction.member.voice.channel;
    if (!queue.connection) await queue.connect(memberVoiceChannel);

    if (queue.isPlaying()) {
        //if a song is already plaing
        await queue.addTrack(song);
        interaction.reply("Added: " + song.title + " to the queue!");
    } else {
        //if there is no song playing
        await queue.play(song);
        interaction.reply("Playing: " + song.title);
    }

    //Print the size of the queue for testing
    console.log(queue.size);
}

async function playPlaylist(queue, playlist, interaction) {

    // Get the voice channel of the user who triggered the command and connect to it
    const memberVoiceChannel = interaction.member.voice.channel;
    if (!queue.connection) await queue.connect(memberVoiceChannel);

    //Add the songs of the playlist to the queue
    for (let index = 0; index < playlist.tracks.length; index++) {
        let song = playlist.tracks[index];
        song.playlist = undefined;
        if (queue.isPlaying()) {
            //if a song is already plaing
            await queue.addTrack(song);         
        } else {
            //if there is no song playing
            await queue.play(song);
        }
    }

    //Get the name of the playlist and the user
    const playlistName = playlist._data.playlist.description;
    const playlistUsername = playlist._data.playlist.author.name;

    //Reply to the user
    interaction.reply("Added playlist: " + playlistName + " by: " + playlistUsername);

    //Print the size of the queue for testing
    console.log(queue.size);
}

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

        //Create a queue
        try {
            // Await the creation of the queue
            if ((queue == undefined) || (!queue.isPlaying() && queue.isEmpty())) {
                queue = await client.player.nodes.create(interaction.guildId);
                console.log("Creating a new queue");
            }

            //Determine if user is giving a link or search terms and get the desired song
            let song = null;
            let result = null;
            if (utils.isYouTubePlaylist(userInput)) {
                //If the user has specified what he gave is a playlist
                result = await client.player.search(userInput, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_PLAYLIST
                });

                if (result.tracks.length === 0) {
                    interaction.reply("No results found for this playlist!");
                    return;
                }

                playPlaylist(queue, result, interaction);
                return;

            } else if (utils.isWholeNumber(userInput)) {
                //If input is a number meaning the user wants to play a song from the songBuffer
                if (songBuffer.length == 0) {
                    interaction.reply("Song buffer is empty. There is nothing to chose from!");
                }
                else {
                    //Get the number
                    const songPos = parseInt(userInput);
                    if (songPos <= 0 || songPos > songBuffer.length) {
                        interaction.reply("Incorrect input. Please chose a number from the list!");
                        return;
                    }

                    //Play the song
                    song = songBuffer[songPos];
                    playSong(queue, song, interaction);

                    //Clear the song buffer
                    songBuffer = [];
                }
                return;
            } else if (utils.isYouTubeLink(userInput)) {
                //If input is a link
                console.log("Input is a link!");
                result = await client.player.search(userInput, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO
                });

                if (result.tracks.length === 0) {
                    interaction.reply("No results found");
                    return;
                }

                //Play the song
                song = result.tracks[0];
                playSong(queue, song, interaction);
                return;
            } else {
                //If input is not a link
                console.log("Input is not a link");
                result = await client.player.search(userInput, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_SEARCH
                });

                if (result.tracks.length === 0) {
                    interaction.reply("No results found");
                    return;
                }

                //Determine the number of songs
                const songCount = result.tracks.length >= 5 ? 5 : result.tracks.length;

                //Clear the song buffer
                songBuffer = [];

                let replyMsg = "Which song to play?\n";
                for (let index = 0; index < songCount; index++) {
                    //Get the song
                    const song = result.tracks[index];
                    //Push the song to the buffer
                    songBuffer.push(song);
                    //Build the reply msg
                    replyMsg += index + 1 + ". " + song.title + "\n";
                }


                interaction.reply(replyMsg);
                return;
            }
        } catch (error) {
            console.error("Error occurred while creating or playing the queue:", error);
            interaction.reply("An error occurred while processing your request.");
        }
    } else if (interaction.commandName === 'skip') {

        if ((queue == undefined) || (!queue.isPlaying() && queue.isEmpty())) {
            interaction.reply("Nothing to skip!");
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