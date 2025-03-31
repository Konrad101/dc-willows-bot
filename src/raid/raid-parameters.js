export { RaidParameters }; 

class RaidParameters {

    constructor(whatRaid,
                startTimestamp,
                duration,
                leaderId,
                gathering,
                buffs,
                requirements,
                mainSquadMaxPlayers,
                reserveSquadMaxPlayers) {
        this.whatRaid = whatRaid;
        this.startTimestamp = startTimestamp;
        this.duration = duration;
        this.leaderId = leaderId;
        this.gathering = gathering;
        this.buffs = buffs;
        this.requirements = requirements;
        this.mainSquadMaxPlayers = mainSquadMaxPlayers;
        this.reserveSquadMaxPlayers = reserveSquadMaxPlayers;
    }
}
