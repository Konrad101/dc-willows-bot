import { EmbedBuilder } from 'discord.js';
import { MEMBERS_BATCH_SIZE, EMBEDDER_COLOR } from '../../config.js';
import { RaidMembersList } from '../raid-members-list.js';

export { RaidEmbedder };


class RaidEmbedder {

    LIST_BATCHES_SEPARATOR = " ";

    constructor(raidParameters, author) {
        this.raidParameters = raidParameters;
        this.author = author;
        
        this.mainSquadList = new RaidMembersList();
        this.reserveSquadList = new RaidMembersList();
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
    getMainSquad() {
        return this.mainSquadList;
    }

    getReserveSquad() {
        return this.reserveSquadList;
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
            this.#createRaidMembersFields('Główny skład:', this.getMainSquad().getMembers(), this.raidParameters.mainSquadMaxPlayers)
        );
        embedderFields = embedderFields.concat(
            this.#createRaidMembersFields('Rezerwa:', this.getReserveSquad().getMembers(), this.raidParameters.reserveSquadMaxPlayers)
        );

        this.embedder
            .setTitle(`${this.raidParameters.date}, ${this.raidParameters.time}\nmaraton rajdów: ${this.raidParameters.whatRaid}`)
            .setFields(embedderFields);
    }

    #createRaidMembersFields(fieldName, raidMembers, maxPlayers) {
        const fields = [];
        const batchesCount = raidMembers.length === 0 ? 
            1 : 
            Math.ceil(raidMembers.length / MEMBERS_BATCH_SIZE);
        for (let i = 1; i <= batchesCount; i++) {
            const name = i === 1 ? fieldName : this.LIST_BATCHES_SEPARATOR;
            const formattedMembers = this.#formatRaidMembers(raidMembers, (i - 1) * MEMBERS_BATCH_SIZE, maxPlayers);
            const membersObject = { name: name, value: `${formattedMembers}` };
            fields.push(membersObject);
        }
        return fields;
    }

    #formatRaidMembers(raidMembers, startingIndex, maxPlayers) {
        if (raidMembers.length === 0) {
            return `\`1. \`➜\` ${maxPlayers}.\` - Brak graczy`;
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
            && raidMembers.length < maxPlayers;

        if (addMissingPlayersText) {
            if (raidMembers.length === maxPlayers - 1) {
                formattedMembers += `\`${raidMembers.length + 1}.\` - Brak ostatniego gracza`;
            } else {
                formattedMembers += `\`${raidMembers.length + 1}. \`➜\` ${maxPlayers}.\` - Brak graczy`;
            }
        }
        return formattedMembers;
    }
}
