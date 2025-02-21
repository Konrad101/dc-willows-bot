export { RaidDetails };

class RaidDetails {

    constructor(channelId, messageWithEmbedder, embedder) {
        this.channelId = channelId;
        this.messageWithEmbedder = messageWithEmbedder;
        this.embedder = embedder;
    }

    hasRaidMember(userId) {
        return this.embedder.getMembers()
            .some(member => member.userId === userId);
    }
}