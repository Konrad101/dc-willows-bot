import { ActionRowBuilder } from '@discordjs/builders';
import { MessageFlags } from 'discord.js';

import { RaidMemberSelectMenu } from '../components/raid-member-select-menu.js';
import { interactionUserHasRoles } from '../../util/user-role-checker.js';
import { 
    SIGN_TO_RAID_ROLES, WARRIOR_SELECT_MENU, ARCHER_SELECT_MENU, 
    MAGE_SELECT_MENU, MARTIAL_ARTIST_SELECT_MENU
} from '../../config.js';

export { 
    RaidSpecialistSelectionService, WARRIOR_MENU_ID, ARCHER_MENU_ID, MAGE_MENU_ID, 
    MARTIAL_ARTIST_MENU_ID, WARRIOR_MENU_ID_RESERVE, ARCHER_MENU_ID_RESERVE, 
    MAGE_MENU_ID_RESERVE, MARTIAL_ARTIST_MENU_ID_RESERVE ,
};

const WARRIOR_MENU_ID = "warriorSelectMenu";
const ARCHER_MENU_ID = "archerSelectMenu";
const MAGE_MENU_ID = "mageSelectMenu";
const MARTIAL_ARTIST_MENU_ID = "martialArtistSelectMenu";
const WARRIOR_MENU_ID_RESERVE = "warriorSelectMenuReserve";
const ARCHER_MENU_ID_RESERVE = "archerSelectMenuReserve";
const MAGE_MENU_ID_RESERVE = "mageSelectMenuReserve";
const MARTIAL_ARTIST_MENU_ID_RESERVE = "martialArtistSelectMenuReserve";


class RaidSpecialistSelectionService {

    async displayMainSquadSpecialistsSelectMenu(interaction) {
        this.#displaySpecialistsSelectMenus(interaction, true);
    }

    async displayReserveSpecialistsSelectMenu(interaction) {
        this.#displaySpecialistsSelectMenus(interaction, false);
    }

    async #displaySpecialistsSelectMenus(interaction, mainSquadSignup) {
        if (!await interactionUserHasRoles(interaction, SIGN_TO_RAID_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień (ról) do zapisania się na rajdy! / Missing permissions (roles) to sign up for raids!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const warriorSelectMenu = new RaidMemberSelectMenu(WARRIOR_SELECT_MENU);
        const archerSelectMenu = new RaidMemberSelectMenu(ARCHER_SELECT_MENU);
        const mageSelectMenu = new RaidMemberSelectMenu(MAGE_SELECT_MENU);
        const martialArtistSelectMenu = new RaidMemberSelectMenu(MARTIAL_ARTIST_SELECT_MENU);

        const warriorMenuCustomId = mainSquadSignup ? WARRIOR_MENU_ID : WARRIOR_MENU_ID_RESERVE;
        const archerMenuCustomId = mainSquadSignup ? ARCHER_MENU_ID : ARCHER_MENU_ID_RESERVE;
        const mageMenuCustomId = mainSquadSignup ? MAGE_MENU_ID : MAGE_MENU_ID_RESERVE;
        const martialArtistMenuCustomId = mainSquadSignup ? MARTIAL_ARTIST_MENU_ID : MARTIAL_ARTIST_MENU_ID_RESERVE;

        interaction.reply({ 
            components: [
                new ActionRowBuilder().addComponents(warriorSelectMenu.loadSelectMenu(warriorMenuCustomId)),
                new ActionRowBuilder().addComponents(archerSelectMenu.loadSelectMenu(archerMenuCustomId)),
                new ActionRowBuilder().addComponents(mageSelectMenu.loadSelectMenu(mageMenuCustomId)),
                new ActionRowBuilder().addComponents(martialArtistSelectMenu.loadSelectMenu(martialArtistMenuCustomId)),
            ],
            flags: MessageFlags.Ephemeral,
        });
    }
}
