export { RaidEndOfPriorityHandler };

class RaidEndOfPriorityHandler {

    constructor(client, raidRepository, messageFetcher) {
        this.client = client;
        this.raidRepository = raidRepository;
        this.messageFetcher = messageFetcher;
    }

    async handle(raidDetails) {
        this.client.channels.cache.get(raidDetails.channelId)
            .send("@everyone **Koniec priorytetu!** Wszyscy mogą się zapisać na główną listę 📝");

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
