import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, MessageFlags } from 'discord.js';
import { RaidParameters } from './raid-parameters.js';
import { RaidEmbedder } from './raid-embedder.js';
import { memberFromInteraction } from './raid-member.js';
import { RaidMemberSelectMenu } from './raid-member-select-menu.js';
import { 
    RESERVE_ROLES, RAID_MANAGEMENT_ROLES, SIGN_TO_RAID_ROLES, 
    WARRIOR_SELECT_MENU, ARCHER_SELECT_MENU, MAGE_SELECT_MENU, MARTIAL_ARTIST_SELECT_MENU
} from '../config.js';

export { 
    RaidService, WARRIOR_SELECT_MENU_CUSTOM_ID, ARCHER_SELECT_MENU_CUSTOM_ID, 
    MAGE_SELECT_MENU_CUSTOM_ID, MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID,
    SIGN_BUTTON_CUSTOM_ID, UNSUBSCRIBE_BUTTON_CUSTOM_ID
};

const WARRIOR_SELECT_MENU_CUSTOM_ID = "warriorSelectMenu";
const ARCHER_SELECT_MENU_CUSTOM_ID = "archerSelectMenu";
const MAGE_SELECT_MENU_CUSTOM_ID = "mageSelectMenu";
const MARTIAL_ARTIST_SELECT_MENU_CUSTOM_ID = "martialArtistSelectMenu";
const SIGN_BUTTON_CUSTOM_ID = "signUpToRaidButton";
const UNSUBSCRIBE_BUTTON_CUSTOM_ID = "unsubscribeFromRaidButton";

class RaidService {

    RAIDS_DETAILS_MAP = new Map();

    constructor() {

    }

    async handleRaidInteraction(interaction) {
        if (!await this.#interactionUserHasValidRoles(interaction, RAID_MANAGEMENT_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do tworzenia/edycji zapisów na rajdy!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

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
        if (!await this.#interactionUserHasValidRoles(interaction, SIGN_TO_RAID_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do zapisania się na rajdy!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.deferReply();
        const memberAdded = raidDetails.embedder.addMember(
            memberFromInteraction(interaction));
        if (memberAdded) {
            raidDetails.interaction.editReply({ 
                embeds: [ raidDetails.embedder.refreshEmbedder() ] 
            });
            interaction.webhook.deleteMessage(interaction.message);
        } else {
            interaction.webhook.editMessage(interaction.message, {
                content: "Brak wolnych miejsc, żeby zapisać się na rajd!",
                components: [],
            });
        }
        await interaction.deleteReply();
    }

    async displaySpecialistsSelectMenus(interaction) {
        if (!await this.#interactionUserHasValidRoles(interaction, SIGN_TO_RAID_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do zapisania się na rajdy!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

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

    async unsubscribeFromRaid(interaction) {
        const raidDetails = this.RAIDS_DETAILS_MAP.get(interaction.channel);
        if (raidDetails === undefined) {
            console.log(`Could not find details for channel: ${interaction.channel}`)
            return;
        }

        await interaction.deferReply();
        raidDetails.embedder.removeMember(interaction.user.id);
        raidDetails.interaction.editReply({ 
            embeds: [ raidDetails.embedder.refreshEmbedder() ] 
        });
        await interaction.deleteReply();
    }

    async kickPlayerFromRaid(interaction) {
        const raidDetails = this.RAIDS_DETAILS_MAP.get(interaction.channel);
        if (raidDetails === undefined) {
            console.log(`Could not find details for channel: ${interaction.channel}`)
            return;
        }
        if (!await this.#interactionUserHasValidRoles(interaction, RAID_MANAGEMENT_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do wyrzucenia gracza z rajdów!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.deferReply();
        const userToKick = interaction.options.get("osoba").user;
        raidDetails.embedder.removeMember(userToKick.id);
        raidDetails.interaction.editReply({
            embeds: [ raidDetails.embedder.refreshEmbedder() ] 
        });
        console.log(`${interaction.user.globalName} (${interaction.user.id})` +
            ` kicks from raid: ${userToKick.globalName} (${userToKick.id})` +
            ` on channel: ${interaction.channel.name}`);
        await interaction.deleteReply();
    }

    async cancelRaid(interaction) {
        const raidDetails = this.RAIDS_DETAILS_MAP.get(interaction.channel);
        if (raidDetails === undefined) {
            console.log(
                `Could not find details to cancel raid for channel: ${interaction.channel}, ` +
                `trigger user id: ${interaction.user.id}`
            );
            await interaction.deferReply();
            await interaction.deleteReply();
            return;
        }
        if (!await this.#interactionUserHasValidRoles(interaction, RAID_MANAGEMENT_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do anulowania rajdów!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.deferReply();
        this.RAIDS_DETAILS_MAP.delete(interaction.channel);
        raidDetails.interaction.deleteReply();
        await interaction.deleteReply();
    }

    /**
     * Checks whether the user provided in @param {*} interaction 
     * has at least one role that is also included in @param {*} validRoles.
     * If user contains valid role, returns true, otherwise returns false.
     */
    async #interactionUserHasValidRoles(interaction, validRoles) {
        return interaction.member.roles.cache
            .map(role => role.name)
            .some(roleName => validRoles.includes(roleName));
    }

    async #handleRaidCreation(interaction, raidParameters) {
        const raidEmbedder = new RaidEmbedder(raidParameters);
        
        await interaction.reply({
            components: [ 
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(SIGN_BUTTON_CUSTOM_ID)
                        .setLabel('Zapisz się')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(UNSUBSCRIBE_BUTTON_CUSTOM_ID)
                        .setLabel('Wypisz się')
                        .setStyle(ButtonStyle.Danger)
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
