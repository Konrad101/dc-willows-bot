export { RaidMembersList }; 

class RaidMembersList {

    constructor(maxMembers) {
        this.maxMembers = maxMembers;
        this.members = [];
    }

    /**
     * Method checks if given member can be added to list:
     * when member was added => returns true,
     * when member could not be added => returns false.
     */
    addMember(raidMember) {
        if (this.members.length >= this.maxMembers) {
            return false;
        }

        this.members.push(raidMember);
        return true;
    }

    hasMember(userId) {
        return this.members.some(member => member.userId === userId);
    }

    isFull() {
        return this.members.length >= this.maxMembers;
    }

    isEmpty() {
        return this.members.length == 0;
    }

    getMembers() {
        return this.members;
    }

    removeMemberByNumberOnList(number) {
        if (this.members.length < number) throw "Number does not exist on the list!";

        return this.members.splice(number - 1, 1)[0];
    }

    removeMember(userId) {
        this.members = this.members.filter(member => member.userId != userId);
    }
}
