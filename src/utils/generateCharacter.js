import { blankCharacter, characterRaces, characterTypes, personalityTraits } from '../data/characterOptions.js'
import { backgrounds, firstNames, goals, lastNames, realms, secrets } from '../data/inspiration.js'

const names = firstNames.flatMap(first => lastNames.map(last => `${first} ${last}`))

export function randomCharacter(previous = {}, lockedFields = [], random = Math.random) {
  const locked = new Set(lockedFields)
  const pick = (options, exclude) => {
    const choices = options.filter(option => option !== exclude)
    return choices[Math.floor(random() * choices.length)]
  }
  const integer = (min, max, exclude) => pick(Array.from({ length: max - min + 1 }, (_, index) => min + index), exclude)
  const keep = key => locked.has(key) && previous[key] !== undefined
  const draft = {
    ...blankCharacter(),
    name: keep('name') ? previous.name : pick(names, previous.name),
    type: keep('type') ? previous.type : pick(characterTypes, previous.type),
    race: keep('race') ? previous.race : pick(characterRaces, previous.race),
    level: keep('level') ? previous.level : integer(1, 20, previous.level),
    realm: keep('realm') ? previous.realm : pick(realms, previous.realm),
    portrait: keep('portrait') ? previous.portrait : pick([0, 1, 2], previous.portrait),
    imageDataUrl: keep('portrait') ? previous.imageDataUrl || '' : '',
    imageName: keep('portrait') ? previous.imageName || '' : '',
  }

  if (keep('traits')) {
    draft.traits = [...previous.traits]
  } else {
    const available = [...personalityTraits]
    const count = integer(2, 4)
    draft.traits = Array.from({ length: count }, () => available.splice(Math.floor(random() * available.length), 1)[0])
    if (draft.traits.length === previous.traits?.length && draft.traits.every(trait => previous.traits.includes(trait))) {
      draft.traits[draft.traits.length - 1] = pick(available)
    }
  }

  draft.stats = keep('stats') ? [...previous.stats] : Array.from({ length: 4 }, (_, index) => integer(1, 20, previous.stats?.[index]))

  if (keep('story')) {
    draft.story = previous.story
  } else {
    const opening = pick(backgrounds.filter(text => !previous.story?.startsWith(text)))
    draft.story = `${opening} Ahora ${pick(goals)}. ${pick(secrets)}`
  }

  return draft
}
