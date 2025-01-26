import dotenv from 'dotenv';
import { REST, Routes, ApplicationCommandOptionType } from 'discord.js';
import { RAID_COMMAND_BUILDER } from './raid-command.js';

dotenv.config();

const commands = [
    {
        name: 'rajdy',
        description: 'Tworzy listę z zapisami na rajdy',
        options: [
            {
                name: 'jakie-rajdy',
                description: 'Jakie rajdy będą robione? (np. valehir)',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'kiedy',
                description: 'Kiedy? (np. poniedziałek, 22.01.2025, 18:30)',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'czas-trwania',
                description: 'Ile czasu zajmą? (np. 1h)',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'lider',
                description: 'Lider rajdów (np. @Zetcu)',
                type: ApplicationCommandOptionType.User,
                required: true,
            },
            {
                name: 'gdzie-i-kiedy-zbiorka',
                description: 'Miejsce, kanał zbiórki i godzina (np. Ain k6 18:30)',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ]
    },
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




