import { SlashCommandBuilder } from 'discord.js';

export const MAIN_SQUAD_MEMBER_DELETION_COMMAND_NAME = 'wyrzuc-z-glownego-skladu';

export const MAIN_SQUAD_MEMBER_DELETION_COMMAND_BUILDER = new SlashCommandBuilder()
    .setName(MAIN_SQUAD_MEMBER_DELETION_COMMAND_NAME)
    .setDescription('Wyrzuca osobę z danego numerka listy głównego składu')
    .addIntegerOption(option =>
        option.setName('numer')
            .setDescription('Numer osoby na liście (np. 1)')
            .setRequired(true));


export const RESERVE_SQUAD_MEMBER_DELETION_COMMAND_NAME = 'wyrzuc-z-rezerwy';

export const RESERVE_SQUAD_MEMBER_DELETION_COMMAND_BUILDER = new SlashCommandBuilder()
    .setName(RESERVE_SQUAD_MEMBER_DELETION_COMMAND_NAME)
    .setDescription('Wyrzuca osobę z danego numerka listy rezerwowej')
    .addIntegerOption(option =>
        option.setName('numer')
            .setDescription('Numer osoby na rezerwie (np. 1)')
            .setRequired(true));
