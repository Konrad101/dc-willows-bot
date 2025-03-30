import { MessageFlags } from 'discord.js';

import { interactionUserHasValidRoles } from '../../util/user-role-validator.js';
import { memberFromInteraction } from '../raid-member.js';
import { SIGN_TO_RAID_ROLES } from '../../config.js';

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
        // TODO: verify if member can signup to main squad - has proper role - priority

        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails === null) {
            console.log(`Could not find details to signup for channel: ${interaction.channel.id}, ` +
                `trigger user id: ${interaction.user.id}`);
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });
            interaction.webhook.editMessage(interaction.message, {
                content: "Błąd: nie udało się znaleźć listy do zapisania na rajd!",
                components: [],
            });
            await interaction.deleteReply();
            return;
        } else if (!await interactionUserHasValidRoles(interaction, SIGN_TO_RAID_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do zapisania się na rajdy!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const squadList = mainSquadSignup ? 
            raidDetails.embedder.getMainSquad() : 
            raidDetails.embedder.getReserveSquad();
        this.#performSignupToList(interaction, raidDetails, squadList);
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
