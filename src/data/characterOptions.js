export const characterTypes = ['Hechicera', 'Hechicero', 'Guerrera', 'Guerrero', 'Pícara', 'Pícaro', 'Exploradora', 'Explorador', 'Sanadora', 'Sanador', 'Paladín', 'Bardo']
export const characterRaces = ['Humana', 'Humano', 'Elfa', 'Elfo', 'Enana', 'Enano', 'Orca', 'Orco', 'Celestial', 'Tiefling', 'Otra']
export const personalityTraits = ['Leal', 'Valiente', 'Reservada', 'Determinada', 'Astuto', 'Independiente', 'Serena', 'Sabia', 'Protectora', 'Irónico', 'Audaz', 'Cauto']
export const attributeNames = ['Fuerza', 'Destreza', 'Inteligencia', 'Carisma']

export function blankCharacter() {
  return { 
    name: '', 
    type: 'Guerrero', 
    race: 'Humana', 
    level: 1, 
    realm: '', 
    portrait: 0, 
    imageDataUrl: '', 
    imageName: '', 
    story: '', 
    traits: [], 
    stats: [10, 10, 10, 10] }
}
