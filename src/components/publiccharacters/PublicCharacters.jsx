import { useEffect, useState } from 'react'
import { obtenerPersonajesPublicos } from '../../services/api.js'
import CharacterCard from '../charactercard/CharacterCard.jsx'
import { Link } from 'react-router'


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
          {personajes.map(personaje => {
            const personajeAdaptado = {
              id: `public-${personaje.idPersonaje}`,
              name: personaje.nombre,
              type: 'Personaje público',
              level: null,
              image: '',
              portrait: null,
              favorite: false,
            }

            return (
              <Link
  key={personaje.idPersonaje}
  to={`/personajes-publicos/${personaje.idPersonaje}`}
  className="public-character-link"
  aria-label={`Consultar ficha pública de ${personaje.nombre}`}
>
  <CharacterCard
    character={personajeAdaptado}
    interactive={false}
  />
</Link>
            )
          })}
        </div>
      )}
    </section>
  )
}