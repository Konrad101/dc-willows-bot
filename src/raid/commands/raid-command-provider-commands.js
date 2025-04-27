import { SlashCommandBuilder } from 'discord.js';

export const RAID_COMMAND_PROVIDER_COMMAND_NAME = 'komenda-rajdu';

export const RAID_COMMAND_PROVIDER_COMMAND_BUILDER = new SlashCommandBuilder()
    .setName(RAID_COMMAND_PROVIDER_COMMAND_NAME)
    .setDescription('Pokazuje komendę do zarządzania aktualnymi zapisami na rajdy (uwzględnia edycję).');
