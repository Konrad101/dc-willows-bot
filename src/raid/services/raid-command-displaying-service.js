import { MessageFlags } from 'discord.js';
import { DateTime } from 'luxon';

import { TIME_ZONE_CODE } from '../../config.js';

export { RaidCommandDisplayingService };

class RaidCommandDisplayingService {

    constructor(raidRepository) {
        this.raidRepository = raidRepository;
    }

    async displayCurrentRaidCommand(interaction) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(`Could not find details to display raid command for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            await interaction.deleteReply();
            return;
        }

        const raidParameters = raidDetails.embedder.raidParameters;
        const raidDateTime = DateTime.fromMillis(raidParameters.startTimestamp).setZone(TIME_ZONE_CODE);
        const raidCommand = `/rajdy ` + 
            `jakie-rajdy: ${raidParameters.whatRaid} ` + 
            `dzien: ${raidDateTime.toFormat("dd.MM.yyyy")} ` +
            `godzina: ${raidDateTime.toFormat("HH:mm")} ` +
            `czas-trwania: ${raidParameters.duration} ` +
            `lider: <@${raidParameters.leaderId}> ` + 
            `gdzie-i-kiedy-zbiorka: ${raidParameters.gathering} ` +
            `odpal: ${raidParameters.buffs} ` + 
            `wymagania: ${raidParameters.requirements} ` + 
            `max-liczba-osob: ${raidParameters.mainSquadMaxPlayers} ` +
            `rezerwa-max-liczba-osob: ${raidParameters.reserveSquadMaxPlayers} `;

        interaction.reply({
            content: `> ${raidCommand}`,
            flags: MessageFlags.Ephemeral,
        });
    }
}
