
/**
 * Extracts unique set of user ids from provided @param raidDetails.
 */
export async function extractUniqueRaidMembers(raidDetails) {
    const mainSquad = raidDetails.embedder.getMainSquad().getMembers();
    const reserveSquad = raidDetails.embedder.getReserveSquad().getMembers();
    
    const allUserIds = mainSquad.map(member => member.userId);
    reserveSquad.forEach(member => allUserIds.push(member.userId));

    return Array.from(new Set(allUserIds));
}
