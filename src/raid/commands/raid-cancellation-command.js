import { SlashCommandBuilder } from 'discord.js';

export const RAID_CANCELLATION_COMMAND_NAME = 'anuluj-rajdy';

export const RAID_CANCELLATION_COMMAND_BUILDER = new SlashCommandBuilder()
    .setName(RAID_CANCELLATION_COMMAND_NAME)
    .setDescription('Anuluje zapisy na rajdy na tym kanale.');
