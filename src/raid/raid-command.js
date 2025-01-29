import { SlashCommandBuilder } from 'discord.js';

export const RAID_COMMAND_BUILDER = new SlashCommandBuilder()
    .setName('rajdy')
    .setDescription('Tworzy listę z zapisami na rajdy')
    .addStringOption(option => 
        option.setName('jakie-rajdy')
            .setDescription('Jakie rajdy będą robione? (np. valehir)')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('dzien')
            .setDescription('TYLKO Data w dniu rajdów (np. 21.01.2025)')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('godzina')
            .setDescription('TYLKO Godzina w dniu rajdów (np. 18:30)')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('czas-trwania')
            .setDescription('Ile czasu zajmą? (np. 1h)')
            .setRequired(true))
    .addUserOption(option => 
        option.setName('lider')
            .setDescription('Lider rajdów (np. @Zetcu)')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('gdzie-i-kiedy-zbiorka')
            .setDescription('Miejsce, kanał zbiórki i godzina (np. Ain k6 18:30)')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('wymagania')
            .setDescription('Wymagania na rajdy (np. 2 ręce i mózg)')
            .setRequired(false))
    .addNumberOption(option => 
        option.setName('max-liczba-osob')
            .setDescription('Maksymalna liczba członków na rajd (domyślnie: 15))')
            .setRequired(false));

