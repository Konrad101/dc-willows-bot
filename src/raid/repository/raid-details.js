export { RaidDetails };

class RaidDetails {

    constructor(channelId, messageId, embedder) {
        this.channelId = channelId;
        this.messageId = messageId;
        this.embedder = embedder;
    }

    hasRaidMember(userId) {
        return this.embedder.getMembers()
            .some(member => member.userId === userId);
    }
}