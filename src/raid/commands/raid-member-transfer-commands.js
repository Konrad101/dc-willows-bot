import { SlashCommandBuilder } from 'discord.js';

export const TRANSFER_MEMBER_FROM_MAIN_SQUAD_COMMAND_NAME = 'przenies-z-glownego-skladu';

export const TRANSFER_MEMBER_FROM_MAIN_SQUAD_COMMAND_BUILDER = new SlashCommandBuilder()
    .setName(TRANSFER_MEMBER_FROM_MAIN_SQUAD_COMMAND_NAME)
    .setDescription('Przenosi osobę z danego numerka głównego składu do rezerwy')
    .addIntegerOption(option =>
        option.setName('numer')
            .setMinValue(1)
            .setMaxValue(50)
            .setDescription('Numer osoby na liście (np. 1)')
            .setRequired(true));


export const TRANSFER_MEMBER_FROM_RESERVE_COMMAND_NAME = 'przenies-z-rezerwy';

export const TRANSFER_MEMBER_FROM_RESERVE_COMMAND_BUILDER = new SlashCommandBuilder()
    .setName(TRANSFER_MEMBER_FROM_RESERVE_COMMAND_NAME)
    .setDescription('Przenosi osobę z danego numerka rezerwy do głównego składu')
    .addIntegerOption(option =>
        option.setName('numer')
            .setMinValue(1)
            .setMaxValue(50)
            .setDescription('Numer osoby na rezerwie (np. 1)')
            .setRequired(true));
