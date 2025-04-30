import { MessageFlags } from 'discord.js';

export { RaidUnsubscribingService };


class RaidUnsubscribingService {

    constructor(messageFetcher, messageSender, raidRepository) {
        this.messageFetcher = messageFetcher;
        this.messageSender = messageSender;
        this.raidRepository = raidRepository;
    }

    async unsubscribeFromMainSquad(interaction) {
        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
                    `unsubscribes from main squad on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        this.#unsubscribeFromRaid(interaction, true);
    }

    async unsubscribeFromReserveSquad(interaction) {
        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
            `unsubscribes from reserve on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        this.#unsubscribeFromRaid(interaction, false);
    }

    async #unsubscribeFromRaid(interaction, unsubscribeFromMainSquad) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(`Could not find details to unsubscribe from raid for channel: ${interaction.channel.id}, ` +
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
        
        this.#removeMemberFromList(interaction, raidDetails, squadList);
    }

    async #removeMemberFromList(interaction, raidDetails, squadList) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        squadList.removeMember(interaction.user.id);
        const message = await this.messageFetcher.fetchMessageFromChannel(
            raidDetails.messageId, 
            raidDetails.channelId
        );
        if (message !== null) {
            message.edit({ embeds: [ raidDetails.embedder.refreshEmbedder() ] });
            await this.raidRepository.save(raidDetails);
            this.messageSender.sendChannelMessage(
                raidDetails.channelId,
                `➖ Użytkownik <@${interaction.user.id}> wypisuje się z listy / ` + 
                `User <@${interaction.user.id}> is unsubscribing from the list`
            );
        } else {
            console.log(`Could not fetch details on unsubscribing for message with id ${raidDetails.messageId}`);
        }

        await interaction.deleteReply();
    }

}
