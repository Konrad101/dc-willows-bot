import { RAID_MANAGEMENT_COMMAND_NAME } from './commands/raid-management-command.js';
import { RAID_CANCELLATION_COMMAND_NAME } from './commands/raid-cancellation-command.js';
import { 
    MAIN_SQUAD_MEMBER_DELETION_COMMAND_NAME, RESERVE_SQUAD_MEMBER_DELETION_COMMAND_NAME 
} from './commands/raid-members-deletion-commands.js';
import { 
    WARRIOR_MENU_ID, ARCHER_MENU_ID, MAGE_MENU_ID, MARTIAL_ARTIST_MENU_ID, 
    WARRIOR_MENU_ID_RESERVE, ARCHER_MENU_ID_RESERVE, MAGE_MENU_ID_RESERVE, 
    MARTIAL_ARTIST_MENU_ID_RESERVE
} from './raid-service.js';
import { 
    SIGN_MAIN_SQUAD_BUTTON_ID, UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID, 
    SIGN_RESERVE_SQUAD_BUTTON_ID, UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID,
} from './raid-saving-service.js';
import { InteractionHandler } from '../interaction-handler-contract.js';

export { RaidInteractionHandler };


class RaidInteractionHandler extends InteractionHandler {

    RAID_INTERACTIONS_COMMAND_NAMES = [
        // commands
        RAID_MANAGEMENT_COMMAND_NAME, RAID_CANCELLATION_COMMAND_NAME, 
        MAIN_SQUAD_MEMBER_DELETION_COMMAND_NAME, RESERVE_SQUAD_MEMBER_DELETION_COMMAND_NAME,
    ];

    RAID_INTERACTIONS_CUSTOM_IDS = [ 
        // buttons
        SIGN_MAIN_SQUAD_BUTTON_ID, UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID, 
        SIGN_RESERVE_SQUAD_BUTTON_ID, UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID,

        // select menus
        WARRIOR_MENU_ID, ARCHER_MENU_ID, MAGE_MENU_ID, MARTIAL_ARTIST_MENU_ID,
        WARRIOR_MENU_ID_RESERVE, ARCHER_MENU_ID_RESERVE, MAGE_MENU_ID_RESERVE, MARTIAL_ARTIST_MENU_ID_RESERVE,
    ];

    constructor(raidSavingService, raidUnsubscribingService, raidCancellationService, raidMemberSignupService, raidService) {
        super();
        this.raidSavingService = raidSavingService;
        this.raidUnsubscribingService = raidUnsubscribingService;
        this.raidCancellationService = raidCancellationService;
        this.raidMemberSignupService = raidMemberSignupService;
        this.raidService = raidService;
    }

    handle(interaction) {
        if (interaction.isChatInputCommand()) {
            this.#handleCommandInteraction(interaction);
        } else if (interaction.isButton()) {
            this.#handleButtonInteraction(interaction);
        } else if (interaction.isStringSelectMenu()) {
            this.#handleSelectMenuInteraction(interaction);
        }
    }

    supports(interaction) {
        const supportsCommand = this.RAID_INTERACTIONS_COMMAND_NAMES
            .some(commandName => interaction.commandName === commandName);
        const supportsCustomId = this.RAID_INTERACTIONS_CUSTOM_IDS
            .some(customId => interaction.customId === customId);
        return supportsCommand || supportsCustomId;
    }

    #handleCommandInteraction(interaction) {
        if (interaction.commandName === RAID_MANAGEMENT_COMMAND_NAME) {
            this.raidSavingService.handleRaidInteraction(interaction);
        } else if (interaction.commandName === RAID_CANCELLATION_COMMAND_NAME) {
            this.raidCancellationService.cancelRaid(interaction);
        } else if (interaction.commandName === MAIN_SQUAD_MEMBER_DELETION_COMMAND_NAME) {
            this.raidService.kickPlayerFromRaid(interaction, true);
        } else if (interaction.commandName === RESERVE_SQUAD_MEMBER_DELETION_COMMAND_NAME) {
            this.raidService.kickPlayerFromRaid(interaction, false);
        } else if (interaction.commandName === MOVE_MEMBER_FROM_MAIN_SQUAD_COMMAND_NAME) {
            
        } else if (interaction.commandName === MOVE_MEMBER_FROM_RESERVE_COMMAND_NAME) {
        
        }
    }

    #handleButtonInteraction(interaction) {
        if (interaction.customId === SIGN_MAIN_SQUAD_BUTTON_ID) {
            this.raidService.displaySpecialistsSelectMenus(interaction, true);
        } else if (interaction.customId === UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID) {
            this.raidUnsubscribingService.unsubscribeFromMainSquad(interaction);
        } else if (interaction.customId === SIGN_RESERVE_SQUAD_BUTTON_ID) {
            this.raidService.displaySpecialistsSelectMenus(interaction, false);
        } else if (interaction.customId === UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID) {
            this.raidUnsubscribingService.unsubscribeFromReserveSquad(interaction);
        }
    }

    #handleSelectMenuInteraction(interaction) {
        if (interaction.customId === WARRIOR_MENU_ID 
            || interaction.customId === ARCHER_MENU_ID 
            || interaction.customId === MAGE_MENU_ID
            || interaction.customId === MARTIAL_ARTIST_MENU_ID) {
            this.raidMemberSignupService.signupToMainSquad(interaction);
        } else if (interaction.customId === WARRIOR_MENU_ID_RESERVE
            || interaction.customId === ARCHER_MENU_ID_RESERVE
            || interaction.customId === MAGE_MENU_ID_RESERVE
            || interaction.customId === MARTIAL_ARTIST_MENU_ID_RESERVE) {
            this.raidMemberSignupService.signupToReserve(interaction);
        } 
    }
}
