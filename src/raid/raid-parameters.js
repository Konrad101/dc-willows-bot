export { RaidParameters }; 

class RaidParameters {

    constructor(whatRaid,
                date,
                time,
                duration,
                leaderId,
                gathering,
                buffs,
                requirements,
                mainSquadMaxPlayers,
                reserveSquadMaxPlayers) {
        this.whatRaid = whatRaid;
        this.date = date;
        this.time = time;
        this.duration = duration;
        this.leaderId = leaderId;
        this.gathering = gathering;
        this.buffs = buffs;
        this.requirements = requirements;
        this.mainSquadMaxPlayers = mainSquadMaxPlayers;
        this.reserveSquadMaxPlayers = reserveSquadMaxPlayers;
    }
}
