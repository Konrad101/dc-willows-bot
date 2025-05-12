export { RaidDMReminder };

class RaidDMReminder {

    constructor(messageFetcher, messageSender, guildId) {
        this.messageFetcher = messageFetcher;
        this.messageSender = messageSender;
        this.guildId = guildId;
    }

    async remindAboutRaid(raidDetails) {
        const message = await this.messageFetcher.fetchMessageFromChannel(
            raidDetails.messageId, raidDetails.channelId);
        if (message === null) {
            console.log(`[scheduled] Omitting sending DMs, embedder message does not exist!`);
            return;
        }

        const raidsMessageLink = `https://discord.com/channels/${this.guildId}/${raidDetails.channelId}/${raidDetails.messageId}`
        const userIds = raidDetails.embedder.getMainSquad().getMembers()
            .map(member => member.userId);

        new Set(userIds)
            .forEach(userId => this.#remindUserAboutRaid(userId, raidsMessageLink));
    }

    async #remindUserAboutRaid(userId, raidsMessageLink) {
        this.messageSender.sendDmMessage(
            userId,
            `🔔⏰ Zaraz rajdy - jesteś na głównej liście! / ` +
            `Raids starting soon - you're on the main squad!\n` + 
            `Link: ${raidsMessageLink}`
        );
    }
}
