import { MessageFlags } from 'discord.js';

import { RAID_MANAGEMENT_ROLES } from '../../config.js';
import { interactionUserHasValidRoles } from '../../util/user-role-validator.js';

export { RaidMemberTransferService };


class RaidMemberTransferService {

    constructor(messageFetcher, messageSender, raidRepository) {
        this.messageFetcher = messageFetcher;
        this.messageSender = messageSender;
        this.raidRepository = raidRepository;
    }

    async transferMainSquadMemberToReserve(interaction) {
        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
            `is transfering member from main squad to reserve`);
        this.#transferMember(interaction, true);
    }

    async transferReserveMemberToMainSquad(interaction) {
        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
            `is transfering member from reserve to main squad`);
        this.#transferMember(interaction, false);
    }

    async #transferMember(interaction, transferFromMainSquad) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(`Could not find details to transfer raid member for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await interaction.deleteReply();
            return;
        } else if (!await interactionUserHasValidRoles(interaction, RAID_MANAGEMENT_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do przeniesienia gracza!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        let memberToTransfer = null;
        const transferFromList = transferFromMainSquad ? 
            raidDetails.embedder.getMainSquad() :
            raidDetails.embedder.getReserveSquad();
        const transferToList = transferFromMainSquad ? 
            raidDetails.embedder.getReserveSquad() :
            raidDetails.embedder.getMainSquad();
        if (transferToList.isFull()) {
            interaction.reply({
                content: `Nie można przenieść gracza - pełna lista!`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        const numberToKick = interaction.options.get("numer").value;
        try {
            memberToTransfer = transferFromList.removeMemberByNumberOnList(numberToKick);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        } catch(err) {
            const listName = transferFromMainSquad ? "głównego składu" : "rezerwy";
            interaction.reply({
                content: `Brak numeru ${numberToKick} do przeniesienia z ${listName}!`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        transferToList.addMember(memberToTransfer);
        const message = await this.messageFetcher.fetchMessageFromChannel(raidDetails.messageId, raidDetails.channelId);
        if (message !== null) {
            message.edit({ embeds: [ raidDetails.embedder.refreshEmbedder() ] });
            this.raidRepository.save(raidDetails);
            this.messageSender.sendChannelMessage(
                raidDetails.channelId,
                `🔁 Użytkownik <@${interaction.user.id}> przenosi użytkownika <@${memberToTransfer.userId}> ` +
                `z ${transferFromMainSquad ? "głównej listy" : "rezerwy"} do ${transferFromMainSquad ? "rezerwy" : "głównej listy"} / ` +
                `User <@${interaction.user.id}> is transfering user <@${memberToTransfer.userId}> ` +
                `from ${transferFromMainSquad ? "main squad" : "reserve"} to the ${transferFromMainSquad ? "reserve" : "main squad"}`
            );
        } else {
            console.log(`Could not fetch message with id: ${raidDetails.messageId} during member transfer`);
        }

        await interaction.deleteReply();
    }

}
