import dotenv from 'dotenv';
import { Client, Events, IntentsBitField } from 'discord.js';
import { DB_FILE_PATH } from './config.js';
import { RaidService } from './raid/raid-service.js';
import { RaidInteractionHandler } from './raid/raid-interaction-handler.js';
import { SqliteRaidDetailsRepository } from './raid/repository/sqlite-raid-detalis-repository.js';


dotenv.config();

const raidRepository = new SqliteRaidDetailsRepository(DB_FILE_PATH);
await raidRepository.initializeDb();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

const interactionHandlers = [];

let raidService = null;

client.on(Events.ClientReady, client => {
    raidService = new RaidService(
        client.guilds.cache.get(process.env.GUILD_ID),
        raidRepository
    );
    interactionHandlers.push(new RaidInteractionHandler(raidService));
    console.log(`${client.user.tag} jest gotowy do działania!`);
});


client.on(Events.InteractionCreate, async interaction => {
    interactionHandlers.find(handler => handler.supports(interaction))
        ?.handle(interaction);
});

// Tworzenie wiadomości na priv
// client.on("messageCreate", async (message) => {
//     if (!message.author.bot) {
//         message.author.send(`Echo ${message.content}`);
//     }
// });

client.login(process.env.DISCORD_TOKEN);

