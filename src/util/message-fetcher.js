export { MessageFetcher };


class MessageFetcher {

    constructor(guild) {
        this.guild = guild;
    }

    /**
     * Returns either existing message or null if it does not exist.
     */
    async fetchMessageFromChannel(messageId, channelId) {
        try {
            return await this.guild
                .channels.cache
                .get(channelId)
                .messages
                .fetch(messageId);
        } catch (ignored) {
            return null;
        }
    }

}
