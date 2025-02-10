import { EmbedBuilder } from 'discord.js';

export { RaidEmbedder };


class RaidEmbedder {

    constructor(raidParameters) {
        this.raidParameters = raidParameters;

        this.members = [];
        // this.members = [ 
        //     new RaidMember("739620586896228424", [ "<:warsp1:1292183221584400617>", ":fire:" ], [ "Maratończyk+" ]),
        //     new RaidMember("739620586896228424", [ ":first_place:" ], [ "Maratończyk+" ]),
        // ];
        this.embedder = null;
    }

    loadEmbedder(author) {
        this.embedder = new EmbedBuilder()
            .setColor(0x9400FF)
            .setAuthor({ name: `${author} tworzy zapisy na rajdy!` });
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

    addMember(raidMember) {
        this.members.push(raidMember);
    }

    removeMember(raidMember) {
        this.removeMember(raidMember.userId);
    }

    removeMember(userId) {
        this.members = this.members.filter(member => member.userId != userId);
    }

    /**
     * Removes completely embedder and scheduled raids.
     */
    delete() {

    }

    #applyRaidParamsToEmbedder() {
        this.embedder
            .setTitle(`${this.raidParameters.date.value}, ${this.raidParameters.time.value}\nmaraton rajdów: ${this.raidParameters.whatRaid.value}`)
            .setFields(
                { name: 'Ile czasu:', value: `${this.raidParameters.duration.value}`, inline: true },
                { name: 'Lider:', value: `<@${this.raidParameters.leader.user.id}>`, inline: true },
                { name: 'Zbiórka:', value: `${this.raidParameters.gathering.value}`, inline: true },
                // TODO: add buffs: pot, tarot, pety
                { name: 'Odpał:', value: `ByczQ nic nie bierz, będzie G` },
                { name: 'Wymagania:', value: `${this.raidParameters.requirements?.value}` },
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
