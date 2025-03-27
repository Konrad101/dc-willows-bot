
/**
 * Checks whether the user provided in @param interaction 
    * has at least one role that is also included in @param validRoles.
    * If user contains valid role, returns true, otherwise returns false.
    */
export async function interactionUserHasValidRoles(interaction, validRoles) {
    return interaction.member.roles.cache
        .map(role => role.name)
        .some(roleName => validRoles.includes(roleName));
}

