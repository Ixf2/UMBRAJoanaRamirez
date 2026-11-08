import { accentColors, contrastModes, elementSizes, textSizes, themes } from '../data/accessibility.js'

export const defaultPreferences = Object.freeze({
  textSize: 'normal', contrast: 'normal', theme: 'dark', elementSize: 'normal', accent: 'red',
  readAloud: false, readingRate: 1, announceNavigation: true, enhancedFocus: false, reduceMotion: false,
})

export function normalizePreferences(saved) {
  const source = saved && typeof saved === 'object' ? saved : {}
  const choose = (key, options) => options.some(option => option.value === source[key]) ? source[key] : defaultPreferences[key]
  return {
    textSize: choose('textSize', textSizes), contrast: choose('contrast', contrastModes),
    theme: choose('theme', themes), elementSize: choose('elementSize', elementSizes), accent: choose('accent', accentColors),
    readAloud: source.readAloud === true,
    readingRate: [0.75, 1, 1.25].includes(source.readingRate) ? source.readingRate : 1,
    announceNavigation: source.announceNavigation !== false,
    enhancedFocus: source.enhancedFocus === true, reduceMotion: source.reduceMotion === true,
  }
}

export function readPreferences(owner, storage = localStorage) {
  const saved = storage.getItem(`umbra.accessibility.v2.${owner}`)
  if (saved !== null) return normalizePreferences(JSON.parse(saved))
  // The previous app-wide settings belong only to the guest. Accounts start independently.
  if (owner === 'guest') {
    const legacy = JSON.parse(storage.getItem('umbra.accessibility.v1') || 'null')
    if (legacy) return normalizePreferences({ textSize: legacy.largeText ? 'large' : 'normal', contrast: legacy.highContrast ? 'high' : 'normal' })
  }
  return { ...defaultPreferences }
}

export function writePreferences(owner, preferences, storage = localStorage) {
  const checked = normalizePreferences(preferences)
  storage.setItem(`umbra.accessibility.v2.${owner}`, JSON.stringify(checked))
  return checked
}
