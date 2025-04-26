import { RaidDetailsRepository } from './raid-details-repository-contract.js';

export { InMemoryRaidDetailsRepository };

class InMemoryRaidDetailsRepository extends RaidDetailsRepository {
    
    constructor() {
        super();
        this.raidDetailsMap = new Map();
    }

    getAll() {
        return this.raidDetailsMap.values();
    }

    getByChannelId(channelId) {
        const raidDetails = this.raidDetailsMap.get(channelId);
        return raidDetails !== undefined ? raidDetails : null;
    }

    save(raidDetails) {
        this.raidDetailsMap.set(raidDetails.channelId, raidDetails);
    } 
    
    deleteByChannelId(channelId) {
        this.raidDetailsMap.delete(channelId);
    }

}
