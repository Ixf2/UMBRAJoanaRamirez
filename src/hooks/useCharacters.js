
import { useCallback, useEffect, useState } from 'react'

import {
  listarMisPersonajes,
  crearPersonajeBD,
  actualizarPersonajeBD,
  eliminarPersonajeBD,
  subirRetratoBD,
  adaptarPersonaje,
  prepararPersonaje
} from '../services/personajesApi.js'

export function useCharacters(owner) {
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState('')

  const refreshCharacters = useCallback(async () => {
    if (owner === 'guest') {
      setCharacters([])
      setLoading(false)
      return []
    }

    try {
      const datos = await listarMisPersonajes()

      if (!Array.isArray(datos)) {
        throw new Error('La respuesta del servidor no es válida.')
      }

      const personajes = datos.map(adaptarPersonaje)

      setCharacters(personajes)
      setStorageError('')

      return personajes
    } catch (error) {
      setStorageError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [owner])

  useEffect(() => {
    let activo = true

    if (owner === 'guest') {
      setCharacters([])
      setLoading(false)
      return
    }

    setLoading(true)

    listarMisPersonajes()
      .then(datos => {
        if (!activo) return

        if (!Array.isArray(datos)) {
          throw new Error('Respuesta incorrecta del servidor.')
        }

        setCharacters(datos.map(adaptarPersonaje))
        setStorageError('')
      })
      .catch(error => {
        if (activo) {
          setStorageError(error.message)
        }
      })
      .finally(() => {
        if (activo) setLoading(false)
      })

    return () => {
      activo = false
    }
  }, [owner])

  async function saveCharacter(draft, archivo = null) {
    const datos = prepararPersonaje(draft)

    const resultado = draft.id
      ? await actualizarPersonajeBD(draft.id, datos)
      : await crearPersonajeBD(datos)

    const character = adaptarPersonaje(resultado)

    if (archivo) {
      try {
        await subirRetratoBD(character.id, archivo)
      } catch (error) {
        await refreshCharacters()

        throw new Error(
          `El personaje se ha guardado, pero no se pudo subir la imagen: ${error.message}`
        )
      }
    }

    await refreshCharacters()

    return character
  }

  async function deleteCharacter(id) {
    await eliminarPersonajeBD(id)
    await refreshCharacters()
  }

  async function toggleFavorite(id) {
    const character = characters.find(
      item => String(item.id) === String(id)
    )

    if (!character) {
      throw new Error('No se encontró el personaje.')
    }

    const datos = prepararPersonaje({
      ...character,
      favorite: !character.favorite
    })

    await actualizarPersonajeBD(id, datos)
    await refreshCharacters()
  }

  
async function replaceCharacters(backup) {
  if (owner === 'guest') {
    throw new Error('Debes iniciar sesión para importar personajes.')
  }

  if (!Array.isArray(backup)) {
    throw new Error('El archivo no contiene una lista válida.')
  }

  const existentes = await listarMisPersonajes()

  if (!Array.isArray(existentes)) {
    throw new Error('No se pudo comprobar la biblioteca actual.')
  }

  const clave = personaje => {
    const historia = personaje.story?.trim() ||
      'Historia pendiente de completar.'

    return [
      personaje.name?.trim().toLocaleLowerCase('es'),
      personaje.type,
      personaje.race,
      Number(personaje.level),
      historia
    ].join('|')
  }

  const claves = new Set(
    existentes.map(personaje =>
      clave(adaptarPersonaje(personaje))
    )
  )

  const resultado = {
    importados: 0,
    omitidos: 0,
    imagenes: 0,
    errores: []
  }

  for (const antiguo of backup) {
    const nombre = antiguo.name || 'Personaje sin nombre'

    try {
      if (nombre.length > 50) {
        throw new Error('El nombre supera los 50 caracteres.')
      }

      const identificador = clave(antiguo)

      if (claves.has(identificador)) {
        resultado.omitidos++
        continue
      }

      const datos = prepararPersonaje({
        ...antiguo,
        id: undefined,
        personality: antiguo.personality || 'Sin definir.',
        visibility: antiguo.visibility || 'privado',
        idCategoria: antiguo.idCategoria || 1
      })

      const creado = await crearPersonajeBD(datos)

      resultado.importados++
      claves.add(identificador)

      if (antiguo.imageDataUrl) {
        try {
          const respuesta = await fetch(antiguo.imageDataUrl)

          if (!respuesta.ok) {
            throw new Error('No se pudo leer el retrato.')
          }

          const blob = await respuesta.blob()

          const extensiones = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/webp': 'webp'
          }

          const extension = extensiones[blob.type]

          if (!extension) {
            throw new Error('Formato de imagen no permitido.')
          }

          const archivo = new File(
            [blob],
            antiguo.imageName || `retrato.${extension}`,
            { type: blob.type }
          )

          await subirRetratoBD(creado.idPersonaje, archivo)
          resultado.imagenes++
        } catch (error) {
          resultado.errores.push(
            `${nombre}: ficha creada, pero no se pudo subir el retrato (${error.message}).`
          )
        }
      }
    } catch (error) {
      resultado.errores.push(
        `${nombre}: ${error.message}`
      )
    }
  }

  try {
    await refreshCharacters()
  } catch (error) {
    resultado.errores.push(
      `No se pudo actualizar la biblioteca: ${error.message}`
    )
  }

  return resultado
}


  return {
    characters,
    loading,
    storageError,
    saveCharacter,
    deleteCharacter,
    toggleFavorite,
    replaceCharacters,
    refreshCharacters
  }
}
