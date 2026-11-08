import { useState } from 'react'
import { defaultPreferences, normalizePreferences, readPreferences, writePreferences } from '../utils/preferenceStore.js'

export function usePreferences(owner) {
  const [loaded] = useState(() => {
    try { return { preferences: readPreferences(owner), error: '' } }
    catch { return { preferences: { ...defaultPreferences }, error: 'No se pudieron recuperar los ajustes de este perfil. Puedes volver a elegirlos.' } }
  })
  const [preferences, setPreferences] = useState(loaded.preferences)
  const [preferenceError, setPreferenceError] = useState(loaded.error)

  function updatePreferences(changes) {
    const updated = normalizePreferences({ ...preferences, ...changes })
    setPreferences(updated)
    try {
      writePreferences(owner, updated)
      setPreferenceError('')
    } catch {
      setPreferenceError('El navegador no permite guardar tus preferencias. Se aplicarán mientras la app esté abierta.')
    }
  }

  return { preferences, updatePreferences, preferenceError }
}
