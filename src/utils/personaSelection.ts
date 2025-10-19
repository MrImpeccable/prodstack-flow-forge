export function togglePersonaInArray(personaIds: string[], personaId: string): string[] {
  return personaIds.includes(personaId)
    ? personaIds.filter(id => id !== personaId)
    : [...personaIds, personaId];
}
