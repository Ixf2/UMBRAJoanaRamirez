
import { useEffect, useState } from 'react'
import { obtenerMisPersonajes } from '../../services/api.js'

const normalizar = valor =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')

export default function DatabaseCharacters({
  search = '',
  type = '',
  favorites = false,
  sort = 'recent'
}) {
  const [personajes, setPersonajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    obtenerMisPersonajes()
      .then(datos => {
        if (!activo) return
        if (!Array.isArray(datos)) {
          throw new Error('Respuesta incorrecta.')
        }
        setPersonajes(datos)
      })
      .catch(() => {
        if (activo) {
          setError('No se pudo cargar tu biblioteca desde MariaDB.')
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const resultados = personajes
    .filter(personaje => {
      const texto = [
        personaje.nombre,
        personaje.clase,
        personaje.raza,
        personaje.origen
      ].join(' ')

      return (
        normalizar(texto).includes(normalizar(search.trim())) &&
        (!type || normalizar(personaje.clase) === normalizar(type)) &&
        (!favorites || personaje.favorito === true)
      )
    })
    .sort((a, b) => {
      if (sort === 'name') {
        return String(a.nombre).localeCompare(
          String(b.nombre),
          'es'
        )
      }

      if (sort === 'level') {
        return Number(b.nivel || 0) - Number(a.nivel || 0)
      }

      return Number(b.idPersonaje) - Number(a.idPersonaje)
    })

  return (
    <section
      className="public-characters-section"
      aria-labelledby="database-characters-title"
    >
      <div className="section-heading">
        <h2 id="database-characters-title">
          Mis personajes en MariaDB
        </h2>
      </div>

      {cargando && (
        <p role="status">Cargando tus personajes...</p>
      )}

      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <p className="search-results" role="status">
            {resultados.length} personajes encontrados.
          </p>

          {resultados.length === 0 && (
            <p className="empty-state">
              No hay personajes que coincidan con los filtros.
            </p>
          )}

          <div className="character-grid">
            {resultados.map(personaje => (
              <article
                className="character-card"
                key={personaje.idPersonaje}
              >
                <details>
                  <summary className="character-info">
                    <strong>{personaje.nombre}</strong>
                    <p>
                      {personaje.clase || 'Sin clase'}
                      {' · '}
                      Nivel {personaje.nivel ?? 1}
                    </p>
                    <p>
                      {personaje.visibilidad === 'publico'
                        ? 'Público'
                        : 'Privado'}
                    </p>
                  </summary>

                  <div className="character-info">
                    <p>
                      Raza: {personaje.raza || 'Sin especificar'}
                    </p>
                    <p>
                      Origen: {personaje.origen || 'Sin especificar'}
                    </p>
                    <p>{personaje.historia}</p>
                  </div>
                </details>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
