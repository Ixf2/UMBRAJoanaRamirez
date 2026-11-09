import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { obtenerPersonajePorId } from '../services/api.js'

export default function PublicCharacterDetail() {
  const { id } = useParams()

  const [personaje, setPersonaje] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    setCargando(true)
    setError('')
    setPersonaje(null)

    obtenerPersonajePorId(id)
      .then(datos => {
        if (activo) setPersonaje(datos)
      })
      .catch(() => {
        if (activo) setError('No se pudo cargar el personaje.')
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [id])

  return (
    <section className="character-detail-page">
      <Link to="/biblioteca" className="secondary-button">
        Volver a biblioteca
      </Link>

      {cargando && <p role="status">Cargando ficha...</p>}

      {error && <p role="alert">{error}</p>}

      {personaje && (
        <article>
          <h2>{personaje.nombre}</h2>

          <p>{personaje.visibilidad}</p>

          <h3>Historia</h3>
          <p>{personaje.historia}</p>

          <h3>Personalidad</h3>
          <p>{personaje.personalidad}</p>

          <h3>Atributos</h3>
          <ul>
            <li>Fuerza: {personaje.fuerza}</li>
            <li>Destreza: {personaje.destreza}</li>
            <li>Inteligencia: {personaje.inteligencia}</li>
            <li>Carisma: {personaje.carisma}</li>
          </ul>
        </article>
      )}
    </section>
  )
}