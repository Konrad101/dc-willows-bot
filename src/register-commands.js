import dotenv from 'dotenv';
import { REST, Routes } from 'discord.js';
import { RAID_COMMAND_BUILDER } from './raid/raid-command.js';

dotenv.config();

const commands = [
    RAID_COMMAND_BUILDER.toJSON(),
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




