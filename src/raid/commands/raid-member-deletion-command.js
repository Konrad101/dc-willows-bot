import { SlashCommandBuilder } from 'discord.js';

export const RAID_MEMBER_DELETION_COMMAND_NAME = 'wyrzuc-z-rajdu';

export const RAID_MEMBER_DELETION_COMMAND_BUILDER = new SlashCommandBuilder()
    .setName(RAID_MEMBER_DELETION_COMMAND_NAME)
    .setDescription('Wyrzuca wskazaną osobę z listy na rajd.')
    .addUserOption(option => 
        option.setName('osoba')
            .setDescription('Osoba zapisana na rajd (np. @Zetcu)')
            .setRequired(true));
