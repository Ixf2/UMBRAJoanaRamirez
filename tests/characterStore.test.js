import assert from 'node:assert/strict'
import test from 'node:test'
import { initialCharacters } from '../src/data/characters.js'
import { importCharacters, normalizeCharacter, readCharacters, writeCharacters } from '../src/utils/characterStore.js'

function memoryStorage() {
  const data = new Map()
  return { getItem: key => data.has(key) ? data.get(key) : null, setItem: (key, value) => data.set(key, value) }
}

test('una biblioteca vacía persiste y las cuentas conservan bibliotecas independientes', () => {
  const storage = memoryStorage()
  assert.equal(readCharacters('guest', storage).length, 6)
  writeCharacters('guest', [], storage)
  assert.deepEqual(readCharacters('guest', storage), [])
  assert.equal(readCharacters('account', storage).length, 6)
  const character = normalizeCharacter({ ...initialCharacters[0], name: 'Nueva leyenda', favorite: true })
  writeCharacters('account', [character], storage)
  assert.deepEqual(readCharacters('account', storage), [character])
  assert.deepEqual(readCharacters('guest', storage), [])
})

test('una copia restaura los datos y rechaza identificadores repetidos o contenido inválido', () => {
  const character = normalizeCharacter(initialCharacters[0])
  const backup = characters => JSON.stringify({ app: 'UMBRA', version: 1, characters })
  assert.deepEqual(importCharacters(backup([character])), [character])
  assert.deepEqual(importCharacters(backup([])), [])
  assert.throws(() => importCharacters('no es JSON'))
  assert.throws(() => importCharacters(JSON.stringify({ version: 2, characters: [] })))
  assert.throws(() => importCharacters(backup([character, character])), /repetidos/)
  for (const changes of [{ level: 21 }, { stats: [1, 2, 3, 99] }, { traits: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, { type: 'Inventada' }, { imageDataUrl: 'javascript:alert(1)' }]) {
    assert.throws(() => importCharacters(backup([{ ...character, ...changes }])))
  }
})

test('un fallo de almacenamiento no destruye la copia anterior', () => {
  const storage = memoryStorage()
  writeCharacters('guest', initialCharacters, storage)
  const before = readCharacters('guest', storage)
  const blocked = { ...storage, setItem: () => { throw new Error('QuotaExceeded') } }
  assert.throws(() => writeCharacters('guest', [], blocked))
  assert.deepEqual(readCharacters('guest', storage), before)
})
