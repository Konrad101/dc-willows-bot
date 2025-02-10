export { RaidMember };

class RaidMember {
    
    constructor(userId, specialists, roles) {
        this.userId = userId;
        this.specialists = specialists;
        this.roles = roles;
    }

    static fromInteraction(interaction) {
        return new RaidMember(
            interaction.user.id,
            interaction.values,
            interaction.member.roles.cache.map(role => role.name),
        );
    }
}

export const memberFromInteraction = RaidMember.fromInteraction;
