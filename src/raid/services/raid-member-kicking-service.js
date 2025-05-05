import { MessageFlags } from 'discord.js';

import { RAID_MANAGEMENT_ROLES } from '../../config.js';
import { interactionUserHasRoles } from '../../util/user-role-checker.js';

export { RaidMemberKickingService };

class RaidMemberKickingService {

    constructor(messageFetcher, messageSender, raidRepository) {
        this.messageFetcher = messageFetcher;
        this.messageSender = messageSender;
        this.raidRepository = raidRepository;
    }

    async kickMainSquadMember(interaction) {
        console.log(`Kicking main squad member` +
            ` on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        this.#kickMember(interaction, true);
    }

    async kickReserveMember(interaction) {
        console.log(`Kicking reserve member` +
            ` on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        this.#kickMember(interaction, false);
    }

    async #kickMember(interaction, kickFromMainSquad) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(`Could not find details to kick raid member for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await interaction.deleteReply();
            return;
        } else if (!await interactionUserHasRoles(interaction, RAID_MANAGEMENT_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do wyrzucenia gracza z rajdów!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const numberToKick = interaction.options.get("numer").value;
        const squadList = kickFromMainSquad ?
            raidDetails.embedder.getMainSquad() : 
            raidDetails.embedder.getReserveSquad();
        let deletedMember = null;
        try {
            deletedMember = squadList.removeMemberByNumberOnList(numberToKick);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch(err) {
            const listName = kickFromMainSquad ? "głównego składu" : "rezerwowej";
            interaction.reply({
                content: `Brak numeru ${numberToKick} do usunięcia na liście ${listName}!`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        console.log(`${interaction.user.globalName} (${interaction.user.id})` +
            ` kicked member: ${deletedMember.userId} (number: ${numberToKick})` +
            ` on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        const message = await this.messageFetcher.fetchMessageFromChannel(raidDetails.messageId, raidDetails.channelId);
        if (message !== null) {
            message.edit({ embeds: [ raidDetails.embedder.refreshEmbedder() ] });
            await this.raidRepository.save(raidDetails);
            this.messageSender.sendChannelMessage(
                interaction.channel.id,
                `💥 Użytkownik <@${interaction.user.id}> wyrzuca użytkownika <@${deletedMember.userId}> z ${kickFromMainSquad ? "głównego składu" : "rezerwy"} / ` +
                `User <@${interaction.user.id}> is kicking user <@${deletedMember.userId}> from the ${kickFromMainSquad ? "main squad" : "reserve"}`
            );
        } else {
            console.log(`Could not fetch details for message with id ${raidDetails.messageId}`);
        }
        await interaction.deleteReply();
    }

}
