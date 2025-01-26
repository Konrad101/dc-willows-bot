import { SlashCommandBuilder } from 'discord.js';

export const RAID_COMMAND_BUILDER = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

export const RAID_INTERACTION_CALLBACK = async interaction => {
    await interaction.reply('Pong!');
}
