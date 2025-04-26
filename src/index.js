import dotenv from 'dotenv';
import { Client, Events, IntentsBitField } from 'discord.js';
import { DB_FILE_PATH } from './config.js';
import { MessageFetcher } from './util/message-fetcher.js';
import { RaidInteractionHandler } from './raid/raid-interaction-handler.js';
import { RaidSchedulersManager } from './raid/scheduler/raid-schedulers-manager.js';
import { SqliteRaidDetailsRepository } from './raid/repository/sqlite-raid-detalis-repository.js';

dotenv.config();

const interactionHandlers = [];
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


client.on(Events.ClientReady, client => {
    const messageFetcher = new MessageFetcher(client.guilds.cache.get(process.env.GUILD_ID));
    const raidSchedulersManager = new RaidSchedulersManager(raidRepository, messageFetcher, client, process.env.GUILD_ID);
    raidSchedulersManager.refreshSchedulers();
    const raidInteractionHandler = new RaidInteractionHandler(messageFetcher, raidRepository, raidSchedulersManager);
    
    interactionHandlers.push(raidInteractionHandler);
    console.log(`${client.user.tag} is ready!`);
});


client.on(Events.InteractionCreate, async interaction => {
    interactionHandlers.find(handler => handler.supports(interaction))
        ?.handle(interaction);
});

client.login(process.env.DISCORD_TOKEN);
