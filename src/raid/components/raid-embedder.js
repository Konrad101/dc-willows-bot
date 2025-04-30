import { EmbedBuilder } from 'discord.js';
import { DateTime } from 'luxon';

import { MEMBERS_BATCH_SIZE, EMBEDDER_COLOR, TIME_ZONE_CODE, TIME_ZONE_LABEL } from '../../config.js';
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
            .setAuthor({ name: `${this.author} tworzy listę na rajdy! / creates list for raids!` });
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
    
    getMainSquad() {
        return this.mainSquadList;
    }

    getReserveSquad() {
        return this.reserveSquadList;
    }

    #applyRaidParamsToEmbedder() {
        let embedderFields = [
            { name: 'Ile czasu/Duration:', value: `${this.raidParameters.duration}`, inline: true },
            { name: 'Lider/Leader:', value: `<@${this.raidParameters.leaderId}>`, inline: true },
            { name: 'Zbiórka/Meeting:', value: `${this.raidParameters.gathering}`, inline: true },
        ];
        if (this.raidParameters.buffs !== undefined) {
            embedderFields.push({ name: 'Odpał/Boost:', value: `${this.raidParameters.buffs}` });
        }
        if (this.raidParameters.requirements !== undefined) {
            embedderFields.push({ name: 'Wymagania/Requirements:', value: `${this.raidParameters.requirements}` });
        }
        // add blank space between params and lists
        embedderFields.push({ name: '\u200B', value: '\u200B' });
        
        embedderFields = embedderFields.concat(
            this.#createRaidMembersFields('Główny skład/Main squad:', this.getMainSquad().getMembers(), this.raidParameters.mainSquadMaxPlayers)
        );
        embedderFields = embedderFields.concat(
            this.#createRaidMembersFields('Rezerwa/Reserve:', this.getReserveSquad().getMembers(), this.raidParameters.reserveSquadMaxPlayers)
        );

        this.embedder
            .setTitle(`📅 ${this.#formatRaidDateTime()} (${TIME_ZONE_LABEL})\n👾 rajdy/raids: ${this.raidParameters.whatRaid}`)
            .setFields(embedderFields);
    }

    #formatRaidDateTime() {
        const raidDateTime = DateTime.fromMillis(this.raidParameters.startTimestamp);
        return raidDateTime.setZone(TIME_ZONE_CODE).toFormat("dd.MM.yyyy, HH:mm");
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
            return `\`1. \`➜\` ${maxPlayers}.\` - Brak graczy / Missing players`;
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
                formattedMembers += `\`${raidMembers.length + 1}.\` - Brak ostatniego gracza / Missing last player`;
            } else {
                formattedMembers += `\`${raidMembers.length + 1}. \`➜\` ${maxPlayers}.\` - Brak graczy / Missing players`;
            }
        }
        return formattedMembers;
    }
}
