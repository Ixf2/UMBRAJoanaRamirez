
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { obtenerPersonajesPublicos } from '../../services/api.js'
import CharacterCard from '../charactercard/CharacterCard.jsx'

// Permite buscar sin distinguir mayúsculas ni acentos
const normalizar = valor =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')

export default function PublicCharacters({
  search = '',
  type = '',
  sort = 'recent'
}) {
  const [personajes, setPersonajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    obtenerPersonajesPublicos()
      .then(datos => {
        if (!activo) return

        if (!Array.isArray(datos)) {
          throw new Error('La respuesta no contiene una lista.')
        }

        setPersonajes(datos)
        setError('')
      })
      .catch(() => {
        if (activo) {
          setError(
            'No se pudieron cargar los personajes públicos. Comprueba la conexión con Spring Boot.'
          )
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

  // Filtrado de los personajes obtenidos del backend
  const resultados = personajes
    .filter(personaje => {
      const texto = [
        personaje.nombre,
        personaje.clase,
        personaje.raza,
        personaje.origen
      ].join(' ')

      const coincideBusqueda = normalizar(texto)
        .includes(normalizar(search.trim()))

      const coincideClase =
        !type ||
        normalizar(personaje.clase) === normalizar(type)

      return coincideBusqueda && coincideClase
    })
    .sort((a, b) => {
      if (sort === 'name') {
        return String(a.nombre ?? '').localeCompare(
          String(b.nombre ?? ''),
          'es'
        )
      }

      if (sort === 'level') {
        return Number(b.nivel ?? 0) - Number(a.nivel ?? 0)
      }

      return Number(b.idPersonaje ?? 0) -
        Number(a.idPersonaje ?? 0)
    })

  return (
    <section
      className="public-characters-section"
      aria-labelledby="public-characters-title"
    >
      <div className="section-heading">
        <h2 id="public-characters-title">
          Personajes públicos
        </h2>
      </div>

      <p className="form-hint">
        Personajes obtenidos desde Spring Boot y MariaDB.
      </p>

      {cargando && (
        <p role="status">
          Cargando personajes públicos...
        </p>
      )}

      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <p
            className="search-results"
            role="status"
            aria-live="polite"
          >
            {resultados.length}{' '}
            {resultados.length > 0
              ? `${resultados.length} ${resultados.length === 1 ? 'personaje público encontrado' : 'personajes públicos encontrados'}.`
              : ''}
          </p>

          {resultados.length === 0 && (
            <p className="empty-state">
              {search.trim() || type
                ? 'No hay personajes públicos que coincidan con los filtros.'
                : 'No hay personajes públicos disponibles.'}
            </p>
          )}

          <div className="character-grid">
            {resultados.map(personaje => {
              const personajeAdaptado = {
                id: `public-${personaje.idPersonaje}`,
                name: personaje.nombre,
                type: personaje.clase || 'Personaje público',
                level: personaje.nivel ?? null,
                image: '',
                portrait: null,
                favorite: false
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
        </>
      )}
    </section>
  )
}
