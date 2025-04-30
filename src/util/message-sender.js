export { MessageSender };

class MessageSender {

    constructor(client) {
        this.client = client;
    }

    sendChannelMessage(channelId, message) {
        this.client.channels.cache.get(channelId)
            ?.send(message);
    }

    sendDmMessage(userId, message) {
        this.client.users.fetch(userId)
            .then(user => user.send(message))
            .catch(console.error);
    }
}
