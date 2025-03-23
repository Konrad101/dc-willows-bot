import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, MessageFlags } from 'discord.js';
import { RaidParameters } from './raid-parameters.js';
import { RaidEmbedder } from './raid-embedder.js';
import { RaidDetails } from './repository/raid-details.js';
import { memberFromInteraction } from './raid-member.js';
import { RaidMemberSelectMenu } from './raid-member-select-menu.js';
import { 
    RAID_MANAGEMENT_ROLES, SIGN_TO_RAID_ROLES, WARRIOR_SELECT_MENU, ARCHER_SELECT_MENU, 
    MAGE_SELECT_MENU, MARTIAL_ARTIST_SELECT_MENU
} from '../config.js';

export { 
    RaidService, WARRIOR_MENU_ID, ARCHER_MENU_ID, MAGE_MENU_ID, 
    MARTIAL_ARTIST_MENU_ID, SIGN_MAIN_SQUAD_BUTTON_ID, UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID, 
    SIGN_RESERVE_SQUAD_BUTTON_ID, UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID, 
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

const SIGN_MAIN_SQUAD_BUTTON_ID = "signUpToMainSquadButton";
const UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID = "unsubscribeFromMainSquadButton";
const SIGN_RESERVE_SQUAD_BUTTON_ID = "signUpToReserveSquadButton";
const UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID = "unsubscribeFromReserveSquadButton";

class RaidService {

    constructor(guild, raidRepository) {
        this.guild = guild;
        this.raidRepository = raidRepository;
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
            interaction.options.get("rezerwa-max-liczba-osob")?.value ?? 10,
        );

        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails !== null) {
            console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
                `edits raids on channel: ${interaction.channel.name} (${interaction.channel.id})`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await this.#updateRaidDetails(raidDetails, raidDetails.embedder.updateEmbedder(raidParameters));
            await interaction.deleteReply();
        } else {
            console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
                `creates raids on channel: ${interaction.channel.name} (${interaction.channel.id})`);
            this.#handleRaidCreation(interaction, raidParameters);
        }
    }

    async addPlayerFromInteraction(interaction, addToMainSquad) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(`Could not find details to sign for raids for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            interaction.webhook.editMessage(interaction.message, {
                content: "Błąd: nie udało się znaleźć listy do zapisania na rajd!",
                components: [],
            });
            await interaction.deleteReply();
            return;
        }
        if (!await this.#interactionUserHasValidRoles(interaction, SIGN_TO_RAID_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do zapisania się na rajdy!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
                `is trying to sign to raids on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const squadList = addToMainSquad ? 
            raidDetails.embedder.getMainSquad() : 
            raidDetails.embedder.getReserveSquad();
        const memberAdded = squadList.addMember(memberFromInteraction(interaction));
        if (memberAdded) {
            this.raidRepository.save(raidDetails);
            this.#updateRaidDetails(raidDetails, raidDetails.embedder.refreshEmbedder());
            interaction.webhook.deleteMessage(interaction.message);
        } else {
            interaction.webhook.editMessage(interaction.message, {
                content: "Brak wolnych miejsc, żeby zapisać się na rajd!",
                components: [],
            });
        }
        await interaction.deleteReply();
    }

    async displaySpecialistsSelectMenus(interaction, mainSquadSignup) {
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

    async unsubscribeFromRaid(interaction, unsubscribeFromMainSquad) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(`Could not find details to unsibscribe from raid for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await interaction.deleteReply();
            return;
        }
        
        const squadList = unsubscribeFromMainSquad ? 
            raidDetails.embedder.getMainSquad() :
            raidDetails.embedder.getReserveSquad();
        if (!squadList.hasMember(interaction.user.id)) {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await interaction.deleteReply();
            return;
        }
        
        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
                `unsubscribes from raids on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        squadList.removeMember(interaction.user.id);
        this.#updateRaidDetails(raidDetails, raidDetails.embedder.refreshEmbedder());
        await interaction.deleteReply();
    }

    async kickPlayerFromRaid(interaction) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(`Could not find details to kick raid member for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await interaction.deleteReply();
            return;
        }
        if (!await this.#interactionUserHasValidRoles(interaction, RAID_MANAGEMENT_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do wyrzucenia gracza z rajdów!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const userToKick = interaction.options.get("osoba").user;
        console.log(`${interaction.user.globalName} (${interaction.user.id})` +
            ` kicks from raid: ${userToKick.globalName} (${userToKick.id})` +
            ` on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        raidDetails.embedder.removeMember(userToKick.id);
        this.#updateRaidDetails(raidDetails, raidDetails.embedder.refreshEmbedder());
        await interaction.deleteReply();
    }

    async cancelRaid(interaction) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(
                `Could not find details to cancel raid for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`
            );
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
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

        console.log(
            `User: ${interaction.user.globalName} (${interaction.user.id}) ` +
            `cancelled raids on channel: ${interaction.channel.name} (${interaction.channel.id})`
        );
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        await this.raidRepository.deleteByChannelId(interaction.channel.id);
        await this.#fetchRaidDetailsMessage(raidDetails)?.delete();

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
        const raidEmbedder = new RaidEmbedder(raidParameters, interaction.user.globalName);
        
        const response = await interaction.reply({
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("mainSquadInfoButton")
                        .setLabel('>> Główny skład <<')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(SIGN_MAIN_SQUAD_BUTTON_ID)
                        .setLabel('Zapisz się')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID)
                        .setLabel('Wypisz się')
                        .setStyle(ButtonStyle.Danger)
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("reserveSquadInfoButton")
                        .setLabel('>>>> Rezerwa <<<<')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(SIGN_RESERVE_SQUAD_BUTTON_ID)
                        .setLabel('Zapisz się')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID)
                        .setLabel('Wypisz się')
                        .setStyle(ButtonStyle.Danger)
                ),
            ],
            embeds: [ raidEmbedder.loadEmbedder() ],
            withResponse: true,
        });

        await this.raidRepository.save(new RaidDetails(
            interaction.channel.id,
            response.resource.message.id,
            raidEmbedder,
        ));
    }

    async #updateRaidDetails(raidDetails, embedder) {
        const message = this.#fetchRaidDetailsMessage(raidDetails);
        if (message !== null) {
            message.edit({ embeds: [ embedder ] });
            await this.raidRepository.save(raidDetails);
        } else {
            console.log(`Could not fetch details message with id ${raidDetails.messageId}`);
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
