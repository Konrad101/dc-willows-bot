export { RaidParameters }; 

class RaidParameters {

    constructor(whatRaid,
                date,
                time,
                duration,
                leader,
                gathering,
                requirements,
                maxPlayers,
                reserveRoles) {
        this.whatRaid = whatRaid;
        this.date = date;
        this.time = time;
        this.duration = duration;
        this.leader = leader;
        this.gathering = gathering;
        this.requirements = requirements;
        this.maxPlayers = maxPlayers;
        this.reserveRoles = reserveRoles;
    }
}
