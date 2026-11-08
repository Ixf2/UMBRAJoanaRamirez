import { initialCharacters } from '../data/characters.js'
import { characterRaces, characterTypes } from '../data/characterOptions.js'

export const MAX_IMAGE_BYTES = 750 * 1024
const imagePattern = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/

export function normalizeCharacter(value) {
  if (!value || typeof value !== 'object') throw new Error('La ficha no es válida.')
  const text = (key, max, required = false) => {
    const result = typeof value[key] === 'string' ? value[key].trim() : ''
    const label = { name: 'nombre', realm: 'origen', story: 'historia', imageDataUrl: 'retrato', imageName: 'nombre de imagen' }[key]
    if ((required && result.length < 2) || result.length > max) throw new Error(`Revisa el campo ${label} de la ficha.`)
    return result
  }
  const name = text('name', 60, true)
  if (!characterTypes.includes(value.type) || !characterRaces.includes(value.race)) throw new Error('La clase o la raza no son válidas.')
  const level = Number(value.level)
  if (!Number.isInteger(level) || level < 1 || level > 20) throw new Error('El nivel debe estar entre 1 y 20.')
  if (!Array.isArray(value.stats) || value.stats.length !== 4 || value.stats.some(stat => !Number.isInteger(stat) || stat < 1 || stat > 20)) throw new Error('Los cuatro atributos deben estar entre 1 y 20.')
  if (!Array.isArray(value.traits) || value.traits.length > 6 || value.traits.some(trait => typeof trait !== 'string' || trait.length > 40)) throw new Error('Puedes elegir hasta seis rasgos.')
  const imageDataUrl = text('imageDataUrl', MAX_IMAGE_BYTES * 1.4)
  if (imageDataUrl && !imagePattern.test(imageDataUrl)) throw new Error('El retrato debe ser una imagen PNG, JPG o WebP.')
  return {
    id: typeof value.id === 'string' && /^[\w-]{1,80}$/.test(value.id) ? value.id : crypto.randomUUID(),
    name, type: value.type, race: value.race, level,
    realm: text('realm', 100), story: text('story', 3000),
    portrait: Number.isInteger(value.portrait) && value.portrait >= 0 && value.portrait <= 5 ? value.portrait : 0,
    imageDataUrl, imageName: text('imageName', 255),
    traits: [...new Set(value.traits)], stats: [...value.stats],
    favorite: value.favorite === true,
    updatedAt: Number.isFinite(value.updatedAt) ? value.updatedAt : 0,
  }
}

export function parseCharacters(values) {
  if (!Array.isArray(values) || values.length > 500) throw new Error('La copia debe contener una lista de hasta 500 personajes.')
  const characters = values.map(normalizeCharacter)
  if (new Set(characters.map(character => character.id)).size !== characters.length) throw new Error('La copia contiene identificadores repetidos.')
  return characters
}

export function readCharacters(owner, storage = localStorage) {
  const saved = storage.getItem(`umbra.characters.v1.${owner}`)
  return saved === null ? initialCharacters.map(normalizeCharacter) : parseCharacters(JSON.parse(saved))
}

export function writeCharacters(owner, characters, storage = localStorage) {
  const checked = parseCharacters(characters)
  storage.setItem(`umbra.characters.v1.${owner}`, JSON.stringify(checked))
  return checked
}

export function importCharacters(contents) {
  let backup
  try { backup = JSON.parse(contents) } catch { throw new Error('El archivo no contiene JSON válido.') }
  if (backup?.app !== 'UMBRA' || backup.version !== 1) throw new Error('Selecciona una copia de seguridad de UMBRA compatible.')
  return parseCharacters(backup.characters)
}

export function downloadCharacters(characters) {
  const blob = new Blob([JSON.stringify({ app: 'UMBRA', version: 1, characters }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `umbra-personajes-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
