import { MessageFlags } from 'discord.js';
import { DateTime, Duration } from 'luxon';

import { interactionUserHasRoles } from '../../util/user-role-checker.js';
import { memberFromInteraction } from '../raid-member.js';
import { 
    SIGN_TO_RAID_ROLES, RAIDS_PRIORITY_ROLES, DISMISSED_RAIDS_PRIORITY_ROLES, END_OF_PRIORITY_DURATION 
} from '../../config.js';

export { RaidMemberSignupService };


class RaidMemberSignupService {
    
    constructor(messageFetcher, messageSender, raidRepository) {
        this.messageFetcher = messageFetcher;
        this.messageSender = messageSender;
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
        if (!await this.#validateIfSignupCanBePerformed(interaction, raidDetails)) {
            return;
        }

        let changedDueToPriority = false;
        if (mainSquadSignup &&
            await this.#priorityIsOnForRaid(raidDetails) &&
            !await interactionUserHasRoles(interaction, RAIDS_PRIORITY_ROLES)) {

            console.log("Changing signup from main squad to reserve due to ongoing priority");
            mainSquadSignup = false;
            changedDueToPriority = true;
        } else if (mainSquadSignup && 
            await interactionUserHasRoles(interaction, DISMISSED_RAIDS_PRIORITY_ROLES)) {
            
            console.log("Changing signup from main squad to reserve due to dismissed priority role");
            mainSquadSignup = false;
            changedDueToPriority = true;
        }

        this.#performSignupToList(interaction, raidDetails, mainSquadSignup, changedDueToPriority);
    }

    /**
     * Validates conditions if user can singup to raids.
     * Returns true if validation passed successfully,
     * otherwise returns false.
     */
    async #validateIfSignupCanBePerformed(interaction, raidDetails) {
        if (raidDetails === null) {
            console.log(`Could not find details to signup for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            interaction.webhook.editMessage(interaction.message, {
                content: "Błąd: nie udało się znaleźć listy do zapisania na rajd! / Error: could not find list to sign up for raids!",
                components: [],
            });
            await interaction.deleteReply();
            return false;
        } else if (!await interactionUserHasRoles(interaction, SIGN_TO_RAID_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień (ról) do zapisania się na rajdy! / Missing permissions (roles) to sign up for raids!",
                flags: MessageFlags.Ephemeral,
            });
            return false;
        }

        return true;
    }

    async #priorityIsOnForRaid(raidDetails) {
        const raidStartTimestamp = raidDetails.embedder.raidParameters.startTimestamp;
        const zeroPriorityDuration = Duration.fromISO(END_OF_PRIORITY_DURATION);
        return raidStartTimestamp > DateTime.now().plus(zeroPriorityDuration).toMillis();
    }

    async #performSignupToList(interaction, raidDetails, mainSquadSignup, changedDueToPriority) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const squadList = mainSquadSignup ? 
            raidDetails.embedder.getMainSquad() : 
            raidDetails.embedder.getReserveSquad();
        
        if (squadList.isFull()) {
            interaction.webhook.editMessage(interaction.message, {
                content: "Brak wolnych miejsc, żeby zapisać się na rajdy! / No free spots left to join the raids!",
                components: [],
            });
            await interaction.deleteReply();
            return;
        }
        
        squadList.addMember(memberFromInteraction(interaction));
        const message = await this.messageFetcher.fetchMessageFromChannel(raidDetails.messageId, raidDetails.channelId);
        if (message !== null) {
            message.edit({ embeds: [ raidDetails.embedder.refreshEmbedder() ] });
            this.raidRepository.save(raidDetails);
            this.#sendSingupMessageToChannel(interaction.user.id, raidDetails, mainSquadSignup, changedDueToPriority);
        } else {
            console.log(`Could not fetch details during singup for message with id ${raidDetails.messageId}`);
        }

        interaction.webhook.deleteMessage(interaction.message);
        await interaction.deleteReply();
    }

    async #sendSingupMessageToChannel(userId, raidDetails, mainSquadSignup, changedDueToPriority) {
        if (changedDueToPriority) {
            this.messageSender.sendChannelMessage(
                raidDetails.channelId,
                `➕ Użytkownik <@${userId}> zostaje zapisany do rezerwy zamiast do głównego składu (trwa priorytet)! / ` +
                `User <@${userId}> is being placed on the reserve list instead of the main squad (priority is active)!`
            );
        } else {
            this.messageSender.sendChannelMessage(
                raidDetails.channelId,
                `➕ Użytkownik <@${userId}> zapisuje się na listę ${mainSquadSignup ? "głównego składu" : "rezerwy"} / ` +
                `User <@${userId}> is signing up for the ${mainSquadSignup ? "main squad" : "reserve"} list`
            );
        }
    }
}
