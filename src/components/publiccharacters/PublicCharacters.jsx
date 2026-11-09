import { useEffect, useState } from 'react'
import { obtenerPersonajesPublicos } from '../../services/api.js'

export default function PublicCharacters() {
  const [personajes, setPersonajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    obtenerPersonajesPublicos()
      .then(datos => {
        if (activo) {
          setPersonajes(datos)
        }
      })
      .catch(() => {
        if (activo) {
          setError('No se pudieron cargar los personajes públicos.')
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false)
        }
      })

    return () => {
      activo = false
    }
  }, [])

  return (
    <section aria-labelledby="public-characters-title">
      <div className="section-heading">
        <h2 id="public-characters-title">Personajes públicos</h2>
      </div>

      {cargando && <p role="status">Cargando personajes...</p>}

      {error && <p role="alert">{error}</p>}

      {!cargando && !error && personajes.length === 0 && (
        <p>No hay personajes públicos disponibles.</p>
      )}

      {!cargando && !error && (
        <div className="character-grid">
          {personajes.map(personaje => (
            <article className="character-card" key={personaje.idPersonaje}>
              <h3>{personaje.nombre}</h3>
              <p>{personaje.historia}</p>
              <p>Fuerza: {personaje.fuerza}</p>
              <p>Destreza: {personaje.destreza}</p>
              <p>Inteligencia: {personaje.inteligencia}</p>
              <p>Carisma: {personaje.carisma}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}