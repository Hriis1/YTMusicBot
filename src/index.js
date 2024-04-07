require('dotenv').config();

const { Client } = require('discord.js');
const { Player, QueryType } = require('discord-player');

const { IntentsBitField, EmbedBuilder } = require('discord.js');

//node packages
const path = require("node:path");

//My files
const utils = require('./utils');
const { strict } = require('node:assert');

//variables
var queue;
var songBuffer = [];

//functions
async function playSong(queue, song, interaction) {

    // Get the voice channel of the user who triggered the command and connect to it
    const memberVoiceChannel = interaction.member.voice.channel;
    //Check if the user is in a voice channel
    if (memberVoiceChannel == null) {
        return -1;
    }
    if (!queue.connection) await queue.connect(memberVoiceChannel);

    if (queue.isPlaying()) {
        //if a song is already plaing
        await queue.addTrack(song);
        await interaction.reply("Added: " + song.title + " to the queue!");
    } else {
        //if there is no song playing
        await queue.play(song);
        await interaction.reply("Playing: " + song.title);
    }

    //Print the size of the queue for testing
    console.log(queue.size);

    return 0;
}

async function playPlaylist(queue, playlist, interaction) {

    // Get the voice channel of the user who triggered the command and connect to it
    const memberVoiceChannel = interaction.member.voice.channel;
    //Check if the user is in a voice channel
    if (memberVoiceChannel == null) {
        return -1;
    }
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
    await interaction.reply("Added playlist: " + playlistName + " by: " + playlistUsername + " to the queue!");

    //Print the size of the queue for testing
    console.log(queue.size);

    return 0;
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
        await interaction.reply("ko staa kopele!");
    } else if (interaction.commandName === 'addorsubtract') {
        const num1 = interaction.options.get('num1').value;
        const num2 = interaction.options.get('num2').value;

        if (interaction.options.get('operation').value === 'add') {
            await interaction.reply(`${num1} + ${num2} = ${num1 + num2}`);
        } else {
            await interaction.reply(`${num1} - ${num2} = ${num1 - num2}`);
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
        await interaction.reply({ embeds: [embed] });
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
                    await interaction.reply("No results found for this playlist!");
                    return;
                }

                if (await playPlaylist(queue, result, interaction) == -1) {
                    await interaction.reply("User must be in a voice channel to play a playlist!");
                    return;
                }
                return;

            } else if (utils.isWholeNumber(userInput)) {
                //If input is a number meaning the user wants to play a song from the songBuffer
                if (songBuffer.length == 0) {
                    await interaction.reply("Song buffer is empty. There is nothing to chose from!");
                }
                else {
                    //Get the number
                    const songPos = parseInt(userInput);
                    if (songPos <= 0 || songPos > songBuffer.length) {
                        await interaction.reply("Incorrect input. Please chose a number from the list!");
                        return;
                    }

                    //Play the song
                    song = songBuffer[songPos];
                    if (await playSong(queue, song, interaction) == -1) {
                        //If playSong failed
                        await interaction.reply("User must be in a voice channel to play a song!");
                        return;
                    }

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
                    await interaction.reply("No results found");
                    return;
                }

                //Play the song
                song = result.tracks[0];
                if (await playSong(queue, song, interaction) == -1) {
                    //If playSong failed
                    await interaction.reply("User must be in a voice channel to play a song!");
                    return;
                }
                return;
            } else {
                //If input is not a link
                console.log("Input is not a link");
                result = await client.player.search(userInput, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_SEARCH
                });

                if (result.tracks.length === 0) {
                    await interaction.reply("No results found");
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


                await interaction.reply(replyMsg);
                return;
            }
        } catch (error) {
            console.error("Error occurred while creating or playing the queue:", error);
            await interaction.reply("An error occurred while processing your request.");
        }
    } else if (interaction.commandName === 'skip') {

        if ((queue == undefined) || (!queue.isPlaying() && queue.isEmpty())) {
            await interaction.reply("Nothing to skip!");
        } else if (queue.isPlaying()) {
            if (queue.size != 0) {
                //If there is another song in the queue
                await queue.node.skip();
                await interaction.reply("Skipped the current song!");
            } else {
                //If this is the last playing song
                queue.delete();
                queue = undefined;
                await interaction.reply("Skipped the current song! No more songs to play!");
            }
        }
    } else if (interaction.commandName === 'clear') {
        await queue.clear();
        await interaction.reply("Cleared the queue!");
        return 0;
    } else if (interaction.commandName === 'kill') {
        //Clear the queue
        await queue.clear();

        //Stop the currently playing song
        queue.delete();
        queue = undefined;

        await interaction.reply("Killed the music!");
        return 0;
    } else if (interaction.commandName === 'queue') {
        if (queue == undefined || queue.isEmpty()) {
            await interaction.reply("Queue is empty!");
            return;
        }
        const tracks = queue.tracks.data;
        let replyMsg = "";
        for (let index = 0; index < tracks.length; index++) {
            const songTitle = tracks[index].title;
            replyMsg += index + ". " + songTitle + "\n";
        }
        await interaction.reply(replyMsg);
        return;
    }
});

client.login(process.env.TOKEN);