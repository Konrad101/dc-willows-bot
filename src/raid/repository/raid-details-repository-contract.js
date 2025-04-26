export { RaidDetailsRepository };

/**
 * Abstraction for defining contract for Raid Repositories.
 * Only for documentation purposes.
 * 
 * Note: one channel id can have only one RaidDetails.
 */
class RaidDetailsRepository {
    
    /**
     * Returns list of all raid details.
     */
    getAll() {}

    /**
     * Returns either RaidDetails or null.
     */
    getByChannelId(channelId) {} 

    /**
     * Only saves to repository, does not return anything.
     */
    save(raidDetails) {} 
    
    /**
     * Only deletes raid details with given channel id from repository.
     * Does not return anything.
     */
    deleteByChannelId(channelId) {}

}
