import dotenv from 'dotenv';
dotenv.config();

import { Client, Events, IntentsBitField } from 'discord.js';
import { RAID_CREATION_COMMAND_NAME } from './raid/commands/raid-creation-command.js'
import { RAID_CANCELLATION_COMMAND_NAME } from './raid/commands/raid-cancellation-command.js'
import { RAID_MEMBER_DELETION_COMMAND_NAME } from './raid/commands/raid-member-deletion-command.js'
import { 
    RaidService, WARRIOR_SELECT_MENU_CUSTOM_ID, ARCHER_SELECT_MENU_CUSTOM_ID,
    MAGE_SELECT_MENU_CUSTOM_ID, MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID,
    SIGN_BUTTON_CUSTOM_ID, UNSUBSCRIBE_BUTTON_CUSTOM_ID
} from './raid/raid-service.js';

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
    if (!interaction.isChatInputCommand() && !interaction.isStringSelectMenu() && !interaction.isButton()) return;

    if (interaction.commandName === RAID_CREATION_COMMAND_NAME) {
        raidService.handleRaidInteraction(interaction);
	} else if (interaction.commandName === RAID_CANCELLATION_COMMAND_NAME) {
        raidService.cancelRaid(interaction);
    } else if (interaction.commandName === RAID_MEMBER_DELETION_COMMAND_NAME) {
        raidService.kickPlayerFromRaid(interaction);
    } else if (interaction.customId === WARRIOR_SELECT_MENU_CUSTOM_ID 
        || interaction.customId === ARCHER_SELECT_MENU_CUSTOM_ID 
        || interaction.customId === MAGE_SELECT_MENU_CUSTOM_ID
        || interaction.customId === MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID) {

        raidService.addPlayerFromInteraction(interaction);
    } else if (interaction.customId === SIGN_BUTTON_CUSTOM_ID) {
        raidService.displaySpecialistsSelectMenus(interaction);
    } else if (interaction.customId === UNSUBSCRIBE_BUTTON_CUSTOM_ID) {
        raidService.unsubscribeFromRaid(interaction);
    }

})

// Tworzenie wiadomości na priv
// client.on("messageCreate", async (message) => {
//     if (!message.author.bot) {
//         message.author.send(`Echo ${message.content}`);
//     }
// });

client.login(process.env.DISCORD_TOKEN);

