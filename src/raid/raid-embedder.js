import { EmbedBuilder } from 'discord.js';
import { MEMBERS_BATCH_SIZE, EMBEDDER_COLOR } from '../config.js'

export { RaidEmbedder };


class RaidEmbedder {

    constructor(raidParameters, author) {
        this.raidParameters = raidParameters;
        this.author = author;
        
        this.members = [];
        this.embedder = null;
    }

    loadEmbedder() {
        this.embedder = new EmbedBuilder()
            .setColor(EMBEDDER_COLOR)
            .setAuthor({ name: `${this.author} tworzy zapisy na rajdy!` });
        return this.refreshEmbedder();
    }
    
    updateEmbedder(raidParameters) {
        this.raidParameters = raidParameters;
        return this.refreshEmbedder();
    }

    refreshEmbedder() {
        this.#applyRaidParamsToEmbedder();
        return this.embedder;
    }
    
    /**
     * Necessary in order to send DM to raid members before start.
     */
    getMembers() {
        return this.members;
    }

    /**
     * Method checks if given member can be added to list:
     * when member was added => returns true,
     * when member could not be added => returns false.
     */
    addMember(raidMember) {
        if (this.members.length >= this.raidParameters.maxPlayers) {
            return false;
        }

        this.members.push(raidMember);
        return true;
    }

    removeMember(raidMember) {
        this.removeMember(raidMember.userId);
    }

    removeMember(userId) {
        this.members = this.members.filter(member => member.userId != userId);
    }

    #applyRaidParamsToEmbedder() {
        // TODO: determine if fields are OK
        let embedderFields = [
            { name: 'Ile czasu:', value: `${this.raidParameters.duration}`, inline: true },
            { name: 'Lider:', value: `<@${this.raidParameters.leaderId}>`, inline: true },
            { name: 'Zbiórka:', value: `${this.raidParameters.gathering}`, inline: true },
            { name: 'Odpał:', value: `Poty, tarot, pety` },
            { name: 'Wymagania:', value: `${this.raidParameters.requirements}` },
            { name: '\u200B', value: '\u200B' },
        ];
        embedderFields = embedderFields.concat(
            this.#createRaidMembersFields('Lista graczy:', this.#getMainSquad())
        );
        embedderFields = embedderFields.concat(
            this.#createRaidMembersFields('Lista rezerwowa:', this.#getReserveSquad())
        );

        this.embedder
            .setTitle(`${this.raidParameters.date}, ${this.raidParameters.time}\nmaraton rajdów: ${this.raidParameters.whatRaid}`)
            .setFields(embedderFields);
    }

    #createRaidMembersFields(fieldName, raidMembers) {
        const fields = [];
        const batchesCount = raidMembers.length === 0 ? 
            1 : 
            Math.ceil(raidMembers.length / MEMBERS_BATCH_SIZE);

        for (let i = 1; i <= batchesCount; i++) {
            const name = i === 1 ? fieldName : " ";
            const formattedMembers = this.#formatRaidMembers(raidMembers, (i - 1) * MEMBERS_BATCH_SIZE);
            const membersObject = { name: name, value: `${formattedMembers}` };
            fields.push(membersObject);
        }

        return fields;
    }

    #formatRaidMembers(raidMembers, startingIndex) {
        if (raidMembers.length === 0) {
            return `\`1. \`➜\` ${this.raidParameters.maxPlayers}.\` - Brak graczy`;
        }

        let formattedMembers = "";
        const lastBatchIndex = Math.min(raidMembers.length, startingIndex + MEMBERS_BATCH_SIZE);
        for (let i = startingIndex; i < lastBatchIndex; i++) {
            const member = raidMembers[i];
            formattedMembers += "`" + (i + 1) + ".`";
            formattedMembers += ` <@${member.userId}> - `;
            
            member.specialists.forEach(specialist => {
                formattedMembers += (specialist);
                if (member.specialists[member.specialists.length - 1] !== specialist) {
                    formattedMembers += " / ";
                }
            });
            if (member.specialists.length === 0) {
                formattedMembers += "???"
            }

            formattedMembers += "\n";
        }
        const addMissingPlayersText = startingIndex + MEMBERS_BATCH_SIZE >= raidMembers.length
            && raidMembers.length < this.raidParameters.maxPlayers;

        if (addMissingPlayersText) {
            if (raidMembers.length === this.raidParameters.maxPlayers - 1) {
                formattedMembers += `\`${raidMembers.length + 1}.\` - Brak ostatniego gracza`;
            } else {
                formattedMembers += `\`${raidMembers.length + 1}. \`➜\` ${this.raidParameters.maxPlayers}.\` - Brak graczy`;
            }
        }
        return formattedMembers;
    }

    #getMainSquad() {
        return this.members.filter(member => !member.roles.some(r => this.raidParameters.reserveRoles.includes(r)));
    }

    #getReserveSquad() {
        return this.members.filter(member => member.roles.some(r => this.raidParameters.reserveRoles.includes(r)));
    }
}
