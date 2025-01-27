import { EmbedBuilder } from 'discord.js';

export { RaidEmbedder, RaidMember };

class RaidMember {
    
    constructor(userId, specialists, roles) {
        this.userId = userId;
        this.specialists = specialists;
        this.roles = roles;
    }
}


class RaidEmbedder {

    DEFAULT_MAX_PLAYERS = 15;
    DEFAULT_RESERVE_ROLE = "Warn";

    constructor(whatRaid,
                date,
                time,
                duration,
                leader,
                gathering,
                requirements,
                maxPlayers=this.DEFAULT_MAX_PLAYERS,
                reserveRole=this.DEFAULT_RESERVE_ROLE) {
        this.whatRaid = whatRaid;
        this.date = date;
        this.time = time;
        this.duration = duration;
        this.leader = leader;
        this.gathering = gathering;
        this.requirements = requirements;

        this.maxPlayers = maxPlayers;
        this.reserveRole = reserveRole;

        // this.members = [];
        this.members = [ 
            new RaidMember("739620586896228424", [ ":rocket:", ":fire:" ], [ "Maratończyk+" ]),
            new RaidMember("739620586896228424", [ ":first_place:" ], [ "Maratończyk+" ]),
        ];
        this.embedder = null;
    }

    loadEmbedder(author) {
        this.embedder = new EmbedBuilder()
            .setColor(0x9400FF)
            .setAuthor({ name: `${author} tworzy zapisy na rajdy!` });
        this.#refreshEmbedder();

        return this.embedder;
    }
    
    editEmbedderDetails(whatRaid,
                        date,
                        time,
                        duration,
                        leader,
                        gathering,
                        requirements,
                        maxPlayers=this.DEFAULT_MAX_PLAYERS,
                        reserveRole=this.DEFAULT_RESERVE_ROLE) {
        this.whatRaid = whatRaid;
        this.date = date;
        this.time = time;
        this.duration = duration;
        this.leader = leader;
        this.gathering = gathering;
        this.requirements = requirements;
        this.maxPlayers = maxPlayers;
        this.reserveRole = reserveRole;

        this.#refreshEmbedder();
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

    #refreshEmbedder() {
        this.embedder
            .setTitle(`${this.date.value}, ${this.time.value}\nmaraton rajdów: ${this.whatRaid.value}`)
            .setFields(
                { name: 'Ile czasu:', value: `${this.duration.value}`, inline: true },
                { name: 'Lider:', value: `<@${this.leader.user.id}>`, inline: true },
                { name: 'Zbiórka:', value: `${this.gathering.value}`, inline: true },
                // TODO: add buffs: pot, tarot, pety
                { name: 'Odpał:', value: `ByczQ nic nie bierz, będzie G` },
                { name: 'Wymagania:', value: `${this.requirements?.value}` },
                { name: '\u200B', value: '\u200B' },
                { name: 'Lista graczy:', value: `${this.#formatRaidMembers(this.#getMainSquad())}` },
                { name: 'Lista rezerwowa:', value: `${this.#formatRaidMembers(this.#getReserveSquad())}` },
            );
    }

    #formatRaidMembers(raidMembers) {
        if (raidMembers.length === 0) {
            return `\`1. \`➜\` ${this.maxPlayers}.\` - Brak graczy`;
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
        if (raidMembers.length < this.maxPlayers) {
            if (raidMembers.length === this.maxPlayers - 1) {
                formattedMembers += `\`${raidMembers.length + 1}.\` - Brak ostatniego gracza`;
            } else {
                formattedMembers += `\`${raidMembers.length + 1}. \`➜\` ${this.maxPlayers}.\` - Brak graczy`;
            }
        }
        return formattedMembers;
    }

    #getMainSquad() {
        return this.members.filter(member => !member.roles.includes(this.reserveRole));
    }

    #getReserveSquad() {
        return this.members.filter(member => member.roles.includes(this.reserveRole));
    }
}
