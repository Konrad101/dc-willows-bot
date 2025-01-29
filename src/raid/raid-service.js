import { RaidParameters } from './raid-parameters.js';
import { RaidEmbedder } from './raid-embedder.js';
export { RaidService };

class RaidService {

    RAIDS_DETAILS_MAP = new Map();

    constructor() {

    }

    async handleRaidInteraction(interaction) {
        const raidParameters = new RaidParameters(
            interaction.options.get("jakie-rajdy"),
            interaction.options.get("dzien"),
            interaction.options.get("godzina"),
            interaction.options.get("czas-trwania"),
            interaction.options.get("lider"),
            interaction.options.get("gdzie-i-kiedy-zbiorka"),
            interaction.options.get("wymagania"),
            // TODO: handle max players and warn roles
        );

        if (this.RAIDS_DETAILS_MAP.has(interaction.channel)) {
            this.#handleRaidEdition(interaction, raidParameters);
        } else {
            this.#handleRaidCreation(interaction, raidParameters);
        }
    }

    async #handleRaidCreation(interaction, raidParameters) {
        const raidEmbedder = new RaidEmbedder(raidParameters);
        // TODO: create choices with SP's emojis 
        
        interaction.reply({ embeds: [ raidEmbedder.loadEmbedder(interaction.user.globalName) ] });

        this.RAIDS_DETAILS_MAP.set(
            interaction.channel, 
            { "interaction": interaction, "embedder": raidEmbedder }
        );
    }

    async #handleRaidEdition(interaction, raidParameters) {
        await interaction.deferReply();
        const interactionWithEmbedder = this.RAIDS_DETAILS_MAP.get(interaction.channel);
        const embedder = interactionWithEmbedder.embedder;
        interactionWithEmbedder.interaction.editReply({ embeds: [ 
            embedder.updateEmbedder(raidParameters) 
        ] });
        await interaction.deleteReply();
    }

}