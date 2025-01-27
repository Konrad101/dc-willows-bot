import dotenv from 'dotenv';
dotenv.config();

import { Client, Events, GuildExplicitContentFilter, IntentsBitField } from 'discord.js';
import { RaidEmbedder } from './raid-embedder.js';

const RAIDS_DETAILS_MAP = new Map();

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
        const whatRaid = interaction.options.get("jakie-rajdy");
        const date = interaction.options.get("dzien");
        const time = interaction.options.get("godzina");
        const duration = interaction.options.get("czas-trwania");
        const leader = interaction.options.get("lider");
        const gathering = interaction.options.get("gdzie-i-kiedy-zbiorka");
        const requirements = interaction.options.get("wymagania");
    
        if (RAIDS_DETAILS_MAP.has(interaction.channel)) {
            await interaction.deferReply();
            const interactionWithEmbedder = RAIDS_DETAILS_MAP.get(interaction.channel);
            const embedder = interactionWithEmbedder.embedder;
            interactionWithEmbedder.interaction.editReply({ embeds: [ 
                embedder.editEmbedderDetails(whatRaid, date, time, duration, leader, gathering, requirements) 
            ] });
            await interaction.deleteReply();
        } else {
            const raidEmbedder = new RaidEmbedder(whatRaid, date, time, duration, leader, gathering, requirements);
            interaction.reply({ embeds: [ raidEmbedder.loadEmbedder(interaction.user.globalName) ] });
            RAIDS_DETAILS_MAP.set(
                interaction.channel, 
                { "interaction": interaction, "embedder": raidEmbedder }
            );
        }
	}

})

// Tworzenie wiadomości na priv
// client.on("messageCreate", async (message) => {
//     if (!message.author.bot) {
//         message.author.send(`Echo ${message.content}`);
//     }
// });

client.login(process.env.DISCORD_TOKEN);

