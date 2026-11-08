import assert from 'node:assert/strict'
import test from 'node:test'
import { inspirationFields } from '../src/data/inspiration.js'
import { normalizeCharacter } from '../src/utils/characterStore.js'
import { randomCharacter } from '../src/utils/generateCharacter.js'

function seededRandom() {
  let seed = 7381
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

test('genera fichas completas válidas y varía todos los campos', () => {
  const random = seededRandom()
  const seen = Object.fromEntries(inspirationFields.map(({ key }) => [key, new Set()]))
  let previous
  for (let index = 0; index < 300; index++) {
    const draft = randomCharacter(previous, [], random)
    assert.doesNotThrow(() => normalizeCharacter({ ...draft, id: `generated-${index}` }))
    assert.ok(draft.story.length > 100)
    assert.equal(new Set(draft.traits).size, draft.traits.length)
    assert.equal(draft.id, undefined)
    assert.equal(draft.imageDataUrl, '')
    for (const { key } of inspirationFields) seen[key].add(JSON.stringify(draft[key]))
    previous = draft
  }
  for (const { key } of inspirationFields) assert.ok(seen[key].size > 1, `El campo ${key} debe variar`)
})

test('cada nueva combinación cambia todos los campos libres incluso con una secuencia aleatoria constante', () => {
  for (const value of [0, 0.999999]) {
    const random = () => value
    const first = randomCharacter(undefined, [], random)
    const next = randomCharacter(first, [], random)
    assert.doesNotThrow(() => normalizeCharacter({ ...next, id: 'next' }))
    for (const { key } of inspirationFields) assert.notDeepEqual(next[key], first[key], key)
    next.stats.forEach((stat, index) => assert.notEqual(stat, first.stats[index]))
  }
})

test('fijar campos conserva sus valores y sus imágenes sin mutar el borrador anterior', () => {
  const first = randomCharacter(undefined, [], () => 0)
  first.imageDataUrl = 'data:image/png;base64,AAAA'
  first.imageName = 'retrato.png'
  const original = structuredClone(first)
  const allFields = inspirationFields.map(({ key }) => key)
  const next = randomCharacter(first, allFields, () => 0.9)
  assert.deepEqual(next, original)
  assert.notEqual(next.stats, first.stats)
  assert.notEqual(next.traits, first.traits)
  assert.deepEqual(first, original)
})

test('regenerar solo los atributos conserva todos los demás campos', () => {
  const first = randomCharacter(undefined, [], () => 0)
  const locked = inspirationFields.filter(({ key }) => key !== 'stats').map(({ key }) => key)
  const next = randomCharacter(first, locked, () => 0.7)
  for (const key of locked) assert.deepEqual(next[key], first[key], key)
  next.stats.forEach((stat, index) => assert.notEqual(stat, first.stats[index]))
})
