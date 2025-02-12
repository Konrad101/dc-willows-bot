import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, MessageFlags } from 'discord.js';
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
    MAGE_SELECT_MENU_CUSTOM_ID, MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID,
    SIGN_BUTTON_CUSTOM_ID
};

const WARRIOR_SELECT_MENU_CUSTOM_ID = "warriorSelectMenu";
const ARCHER_SELECT_MENU_CUSTOM_ID = "archerSelectMenu";
const MAGE_SELECT_MENU_CUSTOM_ID = "mageSelectMenu";
const MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID = "martialArtistSelectMenu";
const SIGN_BUTTON_CUSTOM_ID = "signToRaidButton";

class RaidService {

    RAIDS_DETAILS_MAP = new Map();

    constructor() {

    }

    async handleRaidInteraction(interaction) {
        // TODO: add buttons and then display select-menus per user
        const raidParameters = new RaidParameters(
            interaction.options.get("jakie-rajdy").value,
            interaction.options.get("dzien").value,
            interaction.options.get("godzina").value,
            interaction.options.get("czas-trwania").value,
            interaction.options.get("lider").user.id,
            interaction.options.get("gdzie-i-kiedy-zbiorka").value,
            interaction.options.get("wymagania")?.value,
            interaction.options.get("max-liczba-osob")?.value ?? 15,
            RESERVE_ROLES,
        );

        if (this.RAIDS_DETAILS_MAP.has(interaction.channel)) {
            const raidDetails = this.RAIDS_DETAILS_MAP.get(interaction.channel);
            await interaction.deferReply();
            raidDetails.interaction.editReply({
                embeds: [ raidDetails.embedder.updateEmbedder(raidParameters) ] 
            });
            await interaction.deleteReply();
        } else {
            this.#handleRaidCreation(interaction, raidParameters);
        }
    }

    async addPlayerFromInteraction(interaction) {
        const raidDetails = this.RAIDS_DETAILS_MAP.get(interaction.channel);
        if (raidDetails === undefined) {
            console.log(`Could not find details for channel: ${interaction.channel}`)
            return;
        }

        await interaction.deferReply();
        raidDetails.embedder.addMember(
            memberFromInteraction(interaction));
        raidDetails.interaction.editReply({ 
            embeds: [ raidDetails.embedder.refreshEmbedder() ] 
        });
        interaction.webhook.deleteMessage(interaction.message);
        await interaction.deleteReply();
    }

    async displaySpecialistsSelectMenus(interaction) {
        const warriorSelectMenu = new RaidMemberSelectMenu(WARRIOR_SELECT_MENU);
        const archerSelectMenu = new RaidMemberSelectMenu(ARCHER_SELECT_MENU);
        const mageSelectMenu = new RaidMemberSelectMenu(MAGE_SELECT_MENU);
        const martialArtistSelectMenu = new RaidMemberSelectMenu(MARTIAL_ARTIST_SELECT_MENU);

        interaction.reply({ 
            components: [
                new ActionRowBuilder().addComponents(warriorSelectMenu.loadSelectMenu(WARRIOR_SELECT_MENU_CUSTOM_ID)),
                new ActionRowBuilder().addComponents(archerSelectMenu.loadSelectMenu(ARCHER_SELECT_MENU_CUSTOM_ID)),
                new ActionRowBuilder().addComponents(mageSelectMenu.loadSelectMenu(MAGE_SELECT_MENU_CUSTOM_ID)),
                new ActionRowBuilder().addComponents(martialArtistSelectMenu.loadSelectMenu(MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID)),
            ],
            flags: MessageFlags.Ephemeral,
        })
    }

    async #handleRaidCreation(interaction, raidParameters) {
        const raidEmbedder = new RaidEmbedder(raidParameters);
        
        await interaction.reply({
            components: [ 
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("signToRaidButton")
                        .setLabel('Zapisz się')
                        .setStyle(ButtonStyle.Success)
                ),
            ],
            embeds: [ raidEmbedder.loadEmbedder(interaction.user.globalName) ],
        });

        this.RAIDS_DETAILS_MAP.set(
            interaction.channel,
            {
                "interaction": interaction,
                "embedder": raidEmbedder,
            }
        );
    }

}
