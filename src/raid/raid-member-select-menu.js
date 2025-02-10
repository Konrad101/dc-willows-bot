import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from '@discordjs/builders';

export { RaidMemberSelectMenu };

class RaidMemberSelectMenu {

    constructor(selectMenuConfig) {
        this.placeholderValue = selectMenuConfig.placeholder;
        this.specialistsEmojis = selectMenuConfig.specialists;
    }

    loadSelectMenu(customId) {
        return new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(this.placeholderValue)
            .setMinValues(1)
            .setMaxValues(this.specialistsEmojis.length)
            .addOptions(this.#createMenuOptions());
    }

    #createMenuOptions() {
        const options = [];
        for (let spNumber = 1; spNumber <= this.specialistsEmojis.length; spNumber++) {
            const emoji = this.specialistsEmojis[spNumber - 1];
            options.push(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`SP ${spNumber}`)
                    .setValue(`<:${emoji.name}:${emoji.id}>`)
                    .setEmoji({
                        id: emoji.id,
                        name: emoji.name,
                    })
            );
        }
        return options;
    }
}
