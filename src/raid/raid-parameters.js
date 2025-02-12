export { RaidParameters }; 

class RaidParameters {

    constructor(whatRaid,
                date,
                time,
                duration,
                leaderId,
                gathering,
                requirements,
                maxPlayers,
                reserveRoles) {
        this.whatRaid = whatRaid;
        this.date = date;
        this.time = time;
        this.duration = duration;
        this.leaderId = leaderId;
        this.gathering = gathering;
        this.requirements = requirements;
        this.maxPlayers = maxPlayers;
        this.reserveRoles = reserveRoles;
    }
}
