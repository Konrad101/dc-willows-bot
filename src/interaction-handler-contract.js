export { InteractionHandler };

/**
 * Abstraction for defining contract for Interaction Handlers.
 * Class only for documentation purposes.
 */
class InteractionHandler {

    /**
     * Performs action on given interaction.
     */
    handle(interaction) {}

    /**
     * Returns boolean whether the given handler can handle interaction.
     */
    supports(interaction) {}

}
