import { MessageFlags } from 'discord.js';

import { interactionUserHasValidRoles } from '../../util/user-role-validator.js';
import { RAID_MANAGEMENT_ROLES, RAID_NOTIFICATION_ROLES_IDS } from '../../config.js';

export { RaidCancellationService };


class RaidCancellationService {

    constructor(messageFetcher, messageSender, raidRepository, raidSchedulersManager) {
        this.messageFetcher = messageFetcher;
        this.messageSender = messageSender;
        this.raidRepository = raidRepository;
        this.raidSchedulersManager = raidSchedulersManager;
    }

    async cancelRaid(interaction) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(
                `Could not find details to cancel raids for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`
            );
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await interaction.deleteReply();
            return;
        }
        if (!await interactionUserHasValidRoles(interaction, RAID_MANAGEMENT_ROLES)) {
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
        const message = await this.messageFetcher.fetchMessageFromChannel(raidDetails.messageId, raidDetails.channelId);
        if (message !== null) {
            message.delete();
            this.messageSender.sendChannelMessage(
                interaction.channel.id,
                `${RAID_NOTIFICATION_ROLES_IDS.map(r => `<@&${r}>`).join(' ')} 🗑️ Zapisy na rajdy zostały anulowane! / Raid sign-ups are cancelled!`
            );
        }
        this.raidSchedulersManager.cancelChannelSchedulers(interaction.channel.id);

        await interaction.deleteReply();
    }

}
