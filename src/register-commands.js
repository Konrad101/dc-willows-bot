import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';
import { RAID_MANAGEMENT_COMMAND_BUILDER } from './raid/commands/raid-management-command.js';
import { RAID_CANCELLATION_COMMAND_BUILDER } from './raid/commands/raid-cancellation-command.js';
import { 
    MAIN_SQUAD_MEMBER_DELETION_COMMAND_BUILDER, RESERVE_SQUAD_MEMBER_DELETION_COMMAND_BUILDER 
} from './raid/commands/raid-members-deletion-commands.js';

dotenv.config();

const commands = [
    RAID_MANAGEMENT_COMMAND_BUILDER.toJSON(),
    RAID_CANCELLATION_COMMAND_BUILDER.toJSON(),
    MAIN_SQUAD_MEMBER_DELETION_COMMAND_BUILDER.toJSON(),
    RESERVE_SQUAD_MEMBER_DELETION_COMMAND_BUILDER.toJSON(),
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
