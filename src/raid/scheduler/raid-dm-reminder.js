export { RaidDMReminder };

class RaidDMReminder {

    constructor(client, guildId) {
        this.client = client;
        this.guildId = guildId;
    }

    async remindAboutRaid(raidDetails) {
        const raidsMessageLink = `https://discord.com/channels/${this.guildId}/${raidDetails.channelId}/${raidDetails.messageId}`
        const userIds = raidDetails.embedder.getMainSquad().getMembers()
            .map(member => member.userId);

        new Set(userIds)
            .forEach(userId => this.#remindUserAboutRaid(userId, raidsMessageLink));
    }

    async #remindUserAboutRaid(userId, raidsMessageLink) {
        this.client.users.fetch(userId)
            .then(user => user.send(`🔔⏰ Zaraz rajdy - jesteś na głównej liście!\nLink do listy: ${raidsMessageLink}`))
            .catch(console.error);
    }
}
