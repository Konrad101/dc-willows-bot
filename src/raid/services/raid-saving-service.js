import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, MessageFlags } from 'discord.js';

import { interactionUserHasValidRoles } from '../../util/user-role-validator.js';
import { RaidEmbedder } from '../components/raid-embedder.js';
import { RaidDetails } from '../raid-details.js';
import { RaidParameters } from '../raid-parameters.js';
import { RAID_MANAGEMENT_ROLES } from '../../config.js';

export { 
    RaidSavingService, SIGN_MAIN_SQUAD_BUTTON_ID, UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID,
    SIGN_RESERVE_SQUAD_BUTTON_ID, UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID, 
};

const SIGN_MAIN_SQUAD_BUTTON_ID = "signUpToMainSquadButton";
const UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID = "unsubscribeFromMainSquadButton";
const SIGN_RESERVE_SQUAD_BUTTON_ID = "signUpToReserveSquadButton";
const UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID = "unsubscribeFromReserveSquadButton";

class RaidSavingService {

    constructor(messageFetcher, raidRepository) {
        this.messageFetcher = messageFetcher;
        this.raidRepository = raidRepository;
    }

    async handleRaidInteraction(interaction) {
        if (!await interactionUserHasValidRoles(interaction, RAID_MANAGEMENT_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do tworzenia/edycji zapisów na rajdy!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const raidParameters = await this.#extractRaidParametersFromInteraction(interaction);
        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);

        if (raidDetails !== null) {
            this.#editRaid(interaction, raidDetails, raidParameters);
        } else {
            this.#createRaid(interaction, raidParameters);
        }
    }

    async #extractRaidParametersFromInteraction(interaction) {
        return new RaidParameters(
            interaction.options.get("jakie-rajdy").value,
            interaction.options.get("dzien").value,
            interaction.options.get("godzina").value,
            interaction.options.get("czas-trwania").value,
            interaction.options.get("lider").user.id,
            interaction.options.get("gdzie-i-kiedy-zbiorka").value,
            interaction.options.get("odpal")?.value,
            interaction.options.get("wymagania")?.value,
            interaction.options.get("max-liczba-osob")?.value ?? 15,
            interaction.options.get("rezerwa-max-liczba-osob")?.value ?? 10,
        );
    }

    async #createRaid(interaction, raidParameters) {
        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
            `creates raids on channel: ${interaction.channel.name} (${interaction.channel.id})`);

        const raidEmbedder = new RaidEmbedder(raidParameters, interaction.user.globalName);
        
        const response = await interaction.reply({
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("mainSquadInfoButton")
                        .setLabel('>> Główny skład <<')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(SIGN_MAIN_SQUAD_BUTTON_ID)
                        .setLabel('Zapisz się')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID)
                        .setLabel('Wypisz się')
                        .setStyle(ButtonStyle.Danger)
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("reserveSquadInfoButton")
                        .setLabel('>>>> Rezerwa <<<<')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(SIGN_RESERVE_SQUAD_BUTTON_ID)
                        .setLabel('Zapisz się')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID)
                        .setLabel('Wypisz się')
                        .setStyle(ButtonStyle.Danger)
                ),
            ],
            embeds: [ raidEmbedder.loadEmbedder() ],
            withResponse: true,
        });

        await this.raidRepository.save(new RaidDetails(
            interaction.channel.id,
            response.resource.message.id,
            raidEmbedder,
        ));
    }

    async #editRaid(interaction, raidDetails, raidParameters) {
        console.log(`User: ${interaction.user.globalName} (${interaction.user.id}) ` + 
            `edits raids on channel: ${interaction.channel.name} (${interaction.channel.id})`);
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        
        const message = this.messageFetcher.fetchMessageFromChannel(
            raidDetails.messageId, 
            raidDetails.channelId
        );
        if (message !== null) {
            message.edit({ embeds: [ raidDetails.embedder.updateEmbedder(raidParameters) ] });
            await this.raidRepository.save(raidDetails);
        } else {
            console.log(`Could not fetch details on updating raid details for message with id ${raidDetails.messageId}`);
        }

        await interaction.deleteReply();
    }
}
