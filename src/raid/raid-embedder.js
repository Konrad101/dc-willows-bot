import { EmbedBuilder } from 'discord.js';

export { RaidEmbedder };


class RaidEmbedder {

    constructor(raidParameters, author) {
        this.raidParameters = raidParameters;

        this.members = [];
        // this.members = [ 
        //     new RaidMember("739620586896228424", [ "<:warsp1:1292183221584400617>", ":fire:" ], [ "Maratończyk+" ]),
        //     new RaidMember("739620586896228424", [ ":first_place:" ], [ "Maratończyk+" ]),
        // ];
        this.author = author;
        this.embedder = null;
    }

    loadEmbedder() {
        this.embedder = new EmbedBuilder()
            .setColor(0x9400FF)
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
        this.embedder
            .setTitle(`${this.raidParameters.date}, ${this.raidParameters.time}\nmaraton rajdów: ${this.raidParameters.whatRaid}`)
            .setFields(
                { name: 'Ile czasu:', value: `${this.raidParameters.duration}`, inline: true },
                { name: 'Lider:', value: `<@${this.raidParameters.leaderId}>`, inline: true },
                { name: 'Zbiórka:', value: `${this.raidParameters.gathering}`, inline: true },
                { name: 'Odpał:', value: `Poty, tarot, pety` },
                { name: 'Wymagania:', value: `${this.raidParameters.requirements}` },
                { name: '\u200B', value: '\u200B' },
                { name: 'Lista graczy:', value: `${this.#formatRaidMembers(this.#getMainSquad())}` },
                { name: 'Lista rezerwowa:', value: `${this.#formatRaidMembers(this.#getReserveSquad())}` },
            );
    }

    #formatRaidMembers(raidMembers) {
        if (raidMembers.length === 0) {
            return `\`1. \`➜\` ${this.raidParameters.maxPlayers}.\` - Brak graczy`;
        }

        let formattedMembers = "";
        for (let i = 1; i <= raidMembers.length; i++) {
            const member = raidMembers[i - 1];
            formattedMembers += "`" + i + ".`";
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
        if (raidMembers.length < this.raidParameters.maxPlayers) {
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
