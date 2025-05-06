
/**
 * Checks whether the user provided in @param interaction 
 * has at least one role that is also included in @param roles.
 * If user contains role, returns true, otherwise returns false.
 */
export async function interactionUserHasRoles(interaction, roles) {
    return interaction.member.roles.cache
        .map(role => role.name)
        .some(roleName => roles.includes(roleName));
}
