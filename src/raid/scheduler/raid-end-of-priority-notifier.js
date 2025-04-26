export { RaidEndOfPriorityNotifier };

class RaidEndOfPriorityNotifier {

    constructor(client) {
        this.client = client;
    }

    notify(channelId) {
        this.client.channels.cache.get(channelId)
            .send("@everyone Koniec priorytetu! Wszyscy mogą się zapisać na główną listę 📝");
    }
}
