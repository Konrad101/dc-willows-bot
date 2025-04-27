import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';

import { RAID_SAVING_COMMAND_BUILDER } from './raid/commands/raid-saving-command.js';
import { RAID_CANCELLATION_COMMAND_BUILDER } from './raid/commands/raid-cancellation-command.js';
import { 
    MAIN_SQUAD_MEMBER_DELETION_COMMAND_BUILDER, RESERVE_SQUAD_MEMBER_DELETION_COMMAND_BUILDER 
} from './raid/commands/raid-member-deletion-commands.js';
import { 
    TRANSFER_MEMBER_FROM_MAIN_SQUAD_COMMAND_BUILDER, TRANSFER_MEMBER_FROM_RESERVE_COMMAND_BUILDER 
} from './raid/commands/raid-member-transfer-commands.js';
import { RAID_COMMAND_PROVIDER_COMMAND_BUILDER } from './raid/commands/raid-command-provider-commands.js';

dotenv.config();

const commands = [
    RAID_SAVING_COMMAND_BUILDER.toJSON(),
    RAID_CANCELLATION_COMMAND_BUILDER.toJSON(),
    MAIN_SQUAD_MEMBER_DELETION_COMMAND_BUILDER.toJSON(),
    RESERVE_SQUAD_MEMBER_DELETION_COMMAND_BUILDER.toJSON(),
    TRANSFER_MEMBER_FROM_MAIN_SQUAD_COMMAND_BUILDER.toJSON(),
    TRANSFER_MEMBER_FROM_RESERVE_COMMAND_BUILDER.toJSON(),
    RAID_COMMAND_PROVIDER_COMMAND_BUILDER.toJSON(),
];

const rest = new REST({version: '10'})
    .setToken(process.env.DISCORD_TOKEN);

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
