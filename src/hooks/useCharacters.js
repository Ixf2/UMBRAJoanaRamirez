import { useState } from 'react'
import { normalizeCharacter, parseCharacters, readCharacters, writeCharacters } from '../utils/characterStore.js'

export function useCharacters(owner) {
  const [loaded] = useState(() => {
    try { return { characters: readCharacters(owner), error: '' } }
    catch { return { characters: [], error: 'No se pudo leer la biblioteca guardada. Puedes importar una copia desde Perfil. Comprueba que el navegador permita el almacenamiento local.' } }
  })
  const [characters, setCharacters] = useState(loaded.characters)
  const [storageError, setStorageError] = useState(loaded.error)

  function commit(next) {
    parseCharacters(next)
    try {
      const checked = writeCharacters(owner, next)
      setCharacters(checked)
      setStorageError('')
    } catch {
      const message = 'No se pudo guardar. El almacenamiento puede estar lleno o bloqueado. Exporta una copia desde Perfil y prueba con un retrato más pequeño.'
      setStorageError(message)
      throw new Error(message)
    }
  }

  function saveCharacter(draft) {
    const character = normalizeCharacter({ ...draft, id: draft.id || crypto.randomUUID(), updatedAt: Date.now() })
    const exists = characters.some(item => item.id === character.id)
    commit(exists ? characters.map(item => item.id === character.id ? character : item) : [character, ...characters])
    return character
  }

  return {
    characters, storageError, saveCharacter,
    deleteCharacter: id => commit(characters.filter(character => character.id !== id)),
    toggleFavorite: id => commit(characters.map(character => character.id === id ? { ...character, favorite: !character.favorite } : character)),
    replaceCharacters: commit,
  }
}
