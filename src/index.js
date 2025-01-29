import dotenv from 'dotenv';
dotenv.config();

import { Client, Events, IntentsBitField } from 'discord.js';
import { RaidService } from './raid/raid-service.js';

const raidService = new RaidService();

// client initialization
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on(Events.ClientReady, client => {
    console.log(`${client.user.tag} jest gotowy do działania!`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'rajdy') {
        raidService.handleRaidInteraction(interaction);
	}

})

// Tworzenie wiadomości na priv
// client.on("messageCreate", async (message) => {
//     if (!message.author.bot) {
//         message.author.send(`Echo ${message.content}`);
//     }
// });

client.login(process.env.DISCORD_TOKEN);

