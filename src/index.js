import dotenv from 'dotenv';
dotenv.config();

import { Client, Events, GuildExplicitContentFilter, IntentsBitField } from 'discord.js';
import { RaidEmbedder } from './raid-embedder.js';

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
        const when = interaction.options.get("kiedy");
        const duration = interaction.options.get("czas-trwania");
        const leader = interaction.options.get("lider");
        const gathering = interaction.options.get("gdzie-i-kiedy-zbiorka");
    
        const raidEmbedder = new RaidEmbedder(whatRaid, when, duration, leader, gathering);
        interaction.reply({ embeds: [ raidEmbedder.loadEmbedder(interaction.user.globalName) ] })
	} else if (interaction.commandName === 'ping') {
        interaction.reply({ content: 'Secret Pong!' });
        console.log(new Date());
        await new Promise(r => setTimeout(r, 1000));
        console.log(new Date());
		interaction.editReply('Pong again!');
    }

})

// Tworzenie wiadomości na priv
// client.on("messageCreate", async (message) => {
//     if (!message.author.bot) {
//         message.author.send(`Echo ${message.content}`);
//     }
// });

client.login(process.env.DISCORD_TOKEN);

