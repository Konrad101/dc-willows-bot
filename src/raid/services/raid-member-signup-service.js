import { MessageFlags } from 'discord.js';
import { DateTime, Duration } from 'luxon';

import { interactionUserHasValidRoles } from '../../util/user-role-validator.js';
import { memberFromInteraction } from '../raid-member.js';
import { SIGN_TO_RAID_ROLES, RAIDS_PRIORITY_ROLES } from '../../config.js';

export { RaidMemberSignupService };


class RaidMemberSignupService {
    
    constructor(messageFetcher, raidRepository) {
        this.messageFetcher = messageFetcher;
        this.raidRepository = raidRepository;
    }

    async signupToMainSquad(interaction) {
        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
            `is signing to main squad on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        this.#signupRaidMember(interaction, true);
    }

    async signupToReserve(interaction) {
        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
            `is signing to reserve on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        this.#signupRaidMember(interaction, false);
    }

    async #signupRaidMember(interaction, mainSquadSignup) {
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (!await this.#validateIfSignupCanBePerformed(interaction, raidDetails, mainSquadSignup)) {
            return;
        }

        const squadList = mainSquadSignup ? 
            raidDetails.embedder.getMainSquad() : 
            raidDetails.embedder.getReserveSquad();
        this.#performSignupToList(interaction, raidDetails, squadList);
    }

    /**
     * Validates conditions if user can singup to raids.
     * Returns true if validation passed successfully,
     * otherwise returns false.
     */
    async #validateIfSignupCanBePerformed(interaction, raidDetails, mainSquadSignup) {
        if (raidDetails === null) {
            console.log(`Could not find details to signup for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            interaction.webhook.editMessage(interaction.message, {
                content: "Błąd: nie udało się znaleźć listy do zapisania na rajd!",
                components: [],
            });
            await interaction.deleteReply();
            return false;
        } else if (!await interactionUserHasValidRoles(interaction, SIGN_TO_RAID_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do zapisania się na rajdy!",
                flags: MessageFlags.Ephemeral,
            });
            return false;
        } else if (mainSquadSignup && 
            await this.#priorityIsOnForRaid(raidDetails) &&
            !await interactionUserHasValidRoles(interaction, RAIDS_PRIORITY_ROLES)) {
            
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            interaction.webhook.editMessage(interaction.message, {
                content: "Brak możliwości zapisu na główną listę, trwa priorytet!",
                components: [],
            });
            await interaction.deleteReply();
            return false;
        }

        return true;
    }

    async #priorityIsOnForRaid(raidDetails) {
        const raidStartTimestamp = raidDetails.embedder.raidParameters.startTimestamp;
        const zeroPriorityDuration = Duration.fromObject({ hours: 24 });
        return raidStartTimestamp > DateTime.now().plus(zeroPriorityDuration).toMillis();
    }

    async #performSignupToList(interaction, raidDetails, squadList) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        if (squadList.isFull()) {
            interaction.webhook.editMessage(interaction.message, {
                content: "Brak wolnych miejsc, żeby zapisać się na rajd!",
                components: [],
            });
            await interaction.deleteReply();
            return;
        }
        
        squadList.addMember(memberFromInteraction(interaction));
        const message = this.messageFetcher.fetchMessageFromChannel(raidDetails.messageId, raidDetails.channelId);
        if (message !== null) {
            message.edit({ embeds: [ raidDetails.embedder.refreshEmbedder() ] });
            this.raidRepository.save(raidDetails);
        } else {
            console.log(`Could not fetch details during singup for message with id ${raidDetails.messageId}`);
        }

        interaction.webhook.deleteMessage(interaction.message);
        await interaction.deleteReply();
    }

}
