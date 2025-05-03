import { RAID_NOTIFICATION_ROLES_IDS } from '../../config.js';

export { RaidEndOfPriorityHandler };

class RaidEndOfPriorityHandler {

    constructor(messageSender, raidRepository, messageFetcher) {
        this.messageSender = messageSender;
        this.raidRepository = raidRepository;
        this.messageFetcher = messageFetcher;
    }

    async handle(raidDetails) {
        this.messageSender.sendChannelMessage(
            raidDetails.channelId,
            `${RAID_NOTIFICATION_ROLES_IDS.map(r => `<@&${r}>`).join(' ')} 📝 **Koniec priorytetu!** / **End of priority!**\n` +
            "* Wszyscy mogą się zapisać na główną listę / Everyone can join the main squad\n" +
            "* Gracze z rezerwy trafili do głównego składu / Reserve players have been transferred to the main squad"
        );

        const mainSquad = raidDetails.embedder.getMainSquad();
        const reserveSquad = raidDetails.embedder.getReserveSquad();
        while (!mainSquad.isFull() && !reserveSquad.isEmpty()) {
            mainSquad.addMember(
                reserveSquad.removeMemberByNumberOnList(1)
            );
        }

        const message = await this.messageFetcher.fetchMessageFromChannel(
            raidDetails.messageId, raidDetails.channelId);

        if (message !== null) {
            message.edit({ embeds: [ raidDetails.embedder.refreshEmbedder() ] });
            this.raidRepository.save(raidDetails);
        } else {
            console.log(`Could not fetch message with id: ${raidDetails.messageId} for handling end of priority`);
        }
    }
}
