import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, MessageFlags } from 'discord.js';
import { RaidMemberSelectMenu } from './components/raid-member-select-menu.js';
import { interactionUserHasValidRoles } from '../util/user-role-validator.js';
import { 
    RAID_MANAGEMENT_ROLES, SIGN_TO_RAID_ROLES, WARRIOR_SELECT_MENU, ARCHER_SELECT_MENU, 
    MAGE_SELECT_MENU, MARTIAL_ARTIST_SELECT_MENU
} from '../config.js';

export { 
    RaidService, WARRIOR_MENU_ID, ARCHER_MENU_ID, MAGE_MENU_ID, 
    MARTIAL_ARTIST_MENU_ID,
    WARRIOR_MENU_ID_RESERVE, ARCHER_MENU_ID_RESERVE, MAGE_MENU_ID_RESERVE,
    MARTIAL_ARTIST_MENU_ID_RESERVE
};

const WARRIOR_MENU_ID = "warriorSelectMenu";
const ARCHER_MENU_ID = "archerSelectMenu";
const MAGE_MENU_ID = "mageSelectMenu";
const MARTIAL_ARTIST_MENU_ID = "martialArtistSelectMenu";
const WARRIOR_MENU_ID_RESERVE = "warriorSelectMenuReserve";
const ARCHER_MENU_ID_RESERVE = "archerSelectMenuReserve";
const MAGE_MENU_ID_RESERVE = "mageSelectMenuReserve";
const MARTIAL_ARTIST_MENU_ID_RESERVE = "martialArtistSelectMenuReserve";

class RaidService {

    constructor(guild, raidRepository) {
        this.guild = guild;
        this.raidRepository = raidRepository;
    }

    // TODO: MOVE THIS CODE TO SEPARATE CLASSES
    // TODO: CREATE SEPARATE DIRECTORY - services FOR ALL NEW SERVICES

    async displaySpecialistsSelectMenus(interaction, mainSquadSignup) {
        if (!await interactionUserHasValidRoles(interaction, SIGN_TO_RAID_ROLES)) {
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

    async kickPlayerFromRaid(interaction, kickFromMainSquad) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(`Could not find details to kick raid member for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await interaction.deleteReply();
            return;
        } else if (!await interactionUserHasValidRoles(interaction, RAID_MANAGEMENT_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do wyrzucenia gracza z rajdów!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const numberToKick = interaction.options.get("numer").value;
        console.log(`Kicking member on number ${numberToKick}, from main squad: ${kickFromMainSquad}` +
            ` on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        
        const squadList = kickFromMainSquad ? 
            raidDetails.embedder.getMainSquad() : 
            raidDetails.embedder.getReserveSquad();
        const deletedMember = squadList.removeMemberByNumberOnList(numberToKick);

        console.log(`${interaction.user.globalName} (${interaction.user.id})` +
            ` kicked member: ${deletedMember.userId} from main squad: ${kickFromMainSquad}` +
            ` on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        this.#updateRaidDetails(raidDetails, raidDetails.embedder.refreshEmbedder());
        await interaction.deleteReply();
    }

    async #updateRaidDetails(raidDetails, embedder) {
        const message = this.#fetchRaidDetailsMessage(raidDetails);
        if (message !== null) {
            message.edit({ embeds: [ embedder ] });
            await this.raidRepository.save(raidDetails);
        } else {
            console.log(`Could not fetch details for message with id ${raidDetails.messageId}`);
        }
    }

    /**
     * Returns either existing message with embedder 
     * or null if message does not exist.
     */
    #fetchRaidDetailsMessage(raidDetails) {
        const fetchedMessage = this.guild
            .channels.cache
            .get(raidDetails.channelId)
            .messages.cache
            .find(message => message.id === raidDetails.messageId);
        
        return fetchedMessage !== undefined ? fetchedMessage : null; 
    }

}
