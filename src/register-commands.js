import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';
import { RAID_CREATION_COMMAND_BUILDER } from './raid/commands/raid-creation-command.js';
import { RAID_CANCELLATION_COMMAND_BUILDER } from './raid/commands/raid-cancellation-command.js';
import { RAID_MEMBER_DELETION_COMMAND_BUILDER } from './raid/commands/raid-member-deletion-command.js';

dotenv.config();

const commands = [
    RAID_CREATION_COMMAND_BUILDER.toJSON(),
    RAID_CANCELLATION_COMMAND_BUILDER.toJSON(),
    RAID_MEMBER_DELETION_COMMAND_BUILDER.toJSON(),
];

const rest = new REST({version: '10', }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Registering slash commands...');

        await rest.put(
            Routes.applicationGuildCommands(process.env.BOT_ID, process.env.GUILD_ID),
            {
                body: commands
            }
        );

        console.log('Slash commands were registered succesfully!');
    } catch (error) {
        console.log(`Unexpected error occurred during command: ${error}`)
    }
})();




