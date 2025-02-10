import { ActionRowBuilder } from '@discordjs/builders';
import { RaidParameters } from './raid-parameters.js';
import { RaidEmbedder } from './raid-embedder.js';
import { memberFromInteraction } from './raid-member.js';
import { RaidMemberSelectMenu } from './raid-member-select-menu.js';
import { 
    RESERVE_ROLES, WARRIOR_SELECT_MENU, ARCHER_SELECT_MENU, 
    MAGE_SELECT_MENU, MARTIAL_ARTIST_SELECT_MENU 
} from '../config.js';

export { 
    RaidService, WARRIOR_SELECT_MENU_CUSTOM_ID, ARCHER_SELECT_MENU_CUSTOM_ID, 
    MAGE_SELECT_MENU_CUSTOM_ID, MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID
};

const WARRIOR_SELECT_MENU_CUSTOM_ID = "warriorSelectMenu";
const ARCHER_SELECT_MENU_CUSTOM_ID = "archerSelectMenu";
const MAGE_SELECT_MENU_CUSTOM_ID = "mageSelectMenu";
const MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID = "martialArtistSelectMenu";


class RaidService {

    RAIDS_DETAILS_MAP = new Map();

    constructor() {

    }

    async handleRaidInteraction(interaction) {
        // TODO: extract direct types instead of objects
        const raidParameters = new RaidParameters(
            interaction.options.get("jakie-rajdy"),
            interaction.options.get("dzien"),
            interaction.options.get("godzina"),
            interaction.options.get("czas-trwania"),
            interaction.options.get("lider"),
            interaction.options.get("gdzie-i-kiedy-zbiorka"),
            interaction.options.get("wymagania"),
            interaction.options.get("max-liczba-osob")?.value ?? 15,
            RESERVE_ROLES
            // TODO: handle max players and warn roles
        );

        if (this.RAIDS_DETAILS_MAP.has(interaction.channel)) {
            const raidDetails = this.RAIDS_DETAILS_MAP.get(interaction.channel);
            this.#updateInteractionReply(
                interaction, 
                raidDetails.interaction,
                raidDetails.embedder.updateEmbedder(raidParameters),
            );
        } else {
            this.#handleRaidCreation(interaction, raidParameters);
        }
    }

    addPlayerFromInteraction(interaction) {
        const raidDetails = this.RAIDS_DETAILS_MAP.get(interaction.channel);
        if (raidDetails === undefined) {
            console.log(`Could not find details for channel: ${interaction.channel}`)
            return;
        }

        const member = memberFromInteraction(interaction);
        raidDetails.embedder.addMember(member);
        this.#updateInteractionReply(
            interaction,
            raidDetails.interaction,
            raidDetails.embedder.refreshEmbedder()
        );
    }

    async #handleRaidCreation(interaction, raidParameters) {
        const raidEmbedder = new RaidEmbedder(raidParameters);
        
        const warriorSelectMenu = new RaidMemberSelectMenu(WARRIOR_SELECT_MENU);
        const archerSelectMenu = new RaidMemberSelectMenu(ARCHER_SELECT_MENU);
        const mageSelectMenu = new RaidMemberSelectMenu(MAGE_SELECT_MENU);
        const martialArtistSelectMenu = new RaidMemberSelectMenu(MARTIAL_ARTIST_SELECT_MENU);

        await interaction.reply({ 
            components: [ 
                new ActionRowBuilder().addComponents(warriorSelectMenu.loadSelectMenu(WARRIOR_SELECT_MENU_CUSTOM_ID)),
                new ActionRowBuilder().addComponents(archerSelectMenu.loadSelectMenu(ARCHER_SELECT_MENU_CUSTOM_ID)),
                new ActionRowBuilder().addComponents(mageSelectMenu.loadSelectMenu(MAGE_SELECT_MENU_CUSTOM_ID)),
                new ActionRowBuilder().addComponents(martialArtistSelectMenu.loadSelectMenu(MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID)),
            ], 
            embeds: [ raidEmbedder.loadEmbedder(interaction.user.globalName) ],
        });

        this.RAIDS_DETAILS_MAP.set(
            interaction.channel, 
            { 
                "interaction": interaction,
                "embedder": raidEmbedder, 
                "selectMenus": [ warriorSelectMenu, archerSelectMenu, mageSelectMenu, martialArtistSelectMenu ],
            }
        );
    }

    async #updateInteractionReply(newInteraction, existingInteraction, updatedEmbedder) {
        await newInteraction.deferReply();
        existingInteraction.editReply({ embeds: [ updatedEmbedder ] });
        await newInteraction.deleteReply();
    }

}