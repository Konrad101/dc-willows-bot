export { RaidDMReminder };

class RaidDMReminder {

    constructor(messageSender, guildId) {
        this.messageSender = messageSender;
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
        this.messageSender.sendDmMessage(
            userId,
            `🔔⏰ Zaraz rajdy - jesteś na głównej liście! / ` +
            `Raids starting soon - you're on the main squad!\n` + 
            `Link: ${raidsMessageLink}`
        );
    }
}
