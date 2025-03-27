export { MessageFetcher };


class MessageFetcher {

    constructor(guild) {
        this.guild = guild;
    }

    /**
     * Returns either existing message or null if it does not exist.
     */
    fetchMessageFromChannel(messageId, channelId) {
        const fetchedMessage = this.guild
            .channels.cache
            .get(channelId)
            .messages.cache
            .find(message => message.id === messageId);
        
        return fetchedMessage !== undefined ? fetchedMessage : null; 
    }

}
