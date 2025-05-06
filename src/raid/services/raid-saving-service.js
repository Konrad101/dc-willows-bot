import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, MessageFlags } from 'discord.js';
import { DateTime } from 'luxon';

import { interactionUserHasRoles } from '../../util/user-role-checker.js';
import { extractUniqueRaidMembers } from '../raid-all-members-extractor.js';
import { RaidEmbedder } from '../components/raid-embedder.js';
import { RaidDetails } from '../raid-details.js';
import { RaidParameters } from '../raid-parameters.js';
import { RAID_MANAGEMENT_ROLES, TIME_ZONE_CODE } from '../../config.js';

export { 
    RaidSavingService, SIGN_MAIN_SQUAD_BUTTON_ID, UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID,
    SIGN_RESERVE_SQUAD_BUTTON_ID, UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID, 
};

const SIGN_MAIN_SQUAD_BUTTON_ID = "signUpToMainSquadButton";
const UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID = "unsubscribeFromMainSquadButton";
const SIGN_RESERVE_SQUAD_BUTTON_ID = "signUpToReserveSquadButton";
const UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID = "unsubscribeFromReserveSquadButton";

class RaidSavingService {

    INVALID_DATETIME_ERROR = "INVALID_DATETIME";

    constructor(messageFetcher, messageSender, raidRepository, raidSchedulersManager) {
        this.messageFetcher = messageFetcher;
        this.messageSender = messageSender;
        this.raidRepository = raidRepository;
        this.raidSchedulersManager = raidSchedulersManager;
    }

    async handleRaidInteraction(interaction) {
        if (!await interactionUserHasRoles(interaction, RAID_MANAGEMENT_ROLES)) {
            interaction.reply({
                content: "Brak uprawnień do tworzenia/edycji zapisów na rajdy!",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        let raidParameters;
        try {
            raidParameters = await this.#extractRaidParametersFromInteraction(interaction);
        } catch (err) {
            if (err === this.INVALID_DATETIME_ERROR) {
                interaction.reply({
                    content: "Podano nieprawidłową datę rajdów!",
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                interaction.reply({
                    content: "Podano błędny parametr rajdu!",
                    flags: MessageFlags.Ephemeral,
                });
            }
            
            return;
        }

        const raidDetails = await this.raidRepository.getByChannelId(interaction.channel.id);
        if (raidDetails !== null) {
            await this.#editRaid(interaction, raidDetails, raidParameters);
        } else {
            await this.#createRaid(interaction, raidParameters);
        }
        this.raidSchedulersManager.refreshChannelSchedulers(interaction.channel.id);
    }

    async #extractRaidParametersFromInteraction(interaction) {
        const time = interaction.options.get("godzina").value;
        const date = interaction.options.get("dzien").value;
        const dateTime = DateTime.fromFormat(
            `${date} ${time}`,
            "dd.MM.yyyy HH:mm",
            { zone: TIME_ZONE_CODE }
        );
        if (!dateTime.isValid) throw this.INVALID_DATETIME_ERROR;
        
        return new RaidParameters(
            interaction.options.get("jakie-rajdy").value,
            dateTime.toMillis(),
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
                        .setLabel('| Główny skład / Main squad |')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(SIGN_MAIN_SQUAD_BUTTON_ID)
                        .setLabel('Zapisz się / Sign in')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(UNSUBSCRIBE_MAIN_SQUAD_BUTTON_ID)
                        .setLabel('Wypisz się / Unsubscribe')
                        .setStyle(ButtonStyle.Danger)
                ),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("reserveSquadInfoButton")
                        .setLabel('| Rezerwa           / Reserve          |')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId(SIGN_RESERVE_SQUAD_BUTTON_ID)
                        .setLabel('Zapisz się / Sign in')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(UNSUBSCRIBE_RESERVE_SQUAD_BUTTON_ID)
                        .setLabel('Wypisz się / Unsubscribe')
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
        
        const message = await this.messageFetcher.fetchMessageFromChannel(
            raidDetails.messageId, 
            raidDetails.channelId
        );
        if (message !== null) {
            message.edit({ embeds: [ raidDetails.embedder.updateEmbedder(raidParameters) ] });
            await this.raidRepository.save(raidDetails);
            this.messageSender.sendChannelMessage(
                interaction.channel.id,
                `✏️ Szczegóły rajdów zostały edytowane! / Raids details have been edited! ` +
                `${(await extractUniqueRaidMembers(raidDetails)).map(u => `<@${u}>`).join(' ')}`
            );
        } else {
            console.log(`Could not fetch details on updating raid details for message with id ${raidDetails.messageId}`);
        }

        await interaction.deleteReply();
    }
}
