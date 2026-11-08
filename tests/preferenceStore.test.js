import assert from 'node:assert/strict'
import test from 'node:test'
import { defaultPreferences, normalizePreferences, readPreferences, writePreferences } from '../src/utils/preferenceStore.js'

function memoryStorage() {
  const values = new Map()
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

test('cada perfil y el invitado conservan todos sus ajustes independientes', () => {
  const storage = memoryStorage()
  const first = { ...defaultPreferences, theme: 'sepia', textSize: 'extra-large', contrast: 'high', accent: 'purple', elementSize: 'large', readAloud: true, readingRate: 0.75, enhancedFocus: true, announceNavigation: false, reduceMotion: true }
  writePreferences('account-a', first, storage)
  writePreferences('account-b', { ...defaultPreferences, theme: 'light', accent: 'blue' }, storage)
  writePreferences('guest', { ...defaultPreferences, textSize: 'small' }, storage)
  assert.deepEqual(readPreferences('account-a', storage), first)
  assert.equal(readPreferences('account-b', storage).theme, 'light')
  assert.equal(readPreferences('guest', storage).textSize, 'small')
  assert.deepEqual(readPreferences('new-account', storage), defaultPreferences)
  writePreferences('account-a', defaultPreferences, storage)
  assert.equal(readPreferences('account-b', storage).theme, 'light')
  assert.equal(readPreferences('guest', storage).textSize, 'small')
})

test('los ajustes globales antiguos se recuperan solo para el invitado', () => {
  const storage = memoryStorage()
  storage.setItem('umbra.accessibility.v1', JSON.stringify({ highContrast: true, largeText: true }))
  assert.equal(readPreferences('guest', storage).contrast, 'high')
  assert.equal(readPreferences('guest', storage).textSize, 'large')
  assert.deepEqual(readPreferences('account-a', storage), defaultPreferences)
  writePreferences('guest', defaultPreferences, storage)
  assert.deepEqual(readPreferences('guest', storage), defaultPreferences)
})

test('los valores desconocidos no se aplican y el fallo de guardado no sobrescribe ajustes anteriores', () => {
  const storage = memoryStorage()
  assert.deepEqual(normalizePreferences({ textSize: 'huge', theme: 'unknown', accent: 'invalid', readingRate: 99 }), defaultPreferences)
  assert.deepEqual(normalizePreferences(null), defaultPreferences)
  writePreferences('account-a', defaultPreferences, storage)
  assert.throws(() => writePreferences('account-a', { ...defaultPreferences, theme: 'sepia' }, { ...storage, setItem: () => { throw new Error('Storage blocked') } }))
  assert.deepEqual(readPreferences('account-a', storage), defaultPreferences)
})
