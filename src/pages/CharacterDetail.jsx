
import { useEffect, useId, useRef, useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useParams
} from 'react-router'

import Portrait from '../components/charactercard/Portrait.jsx'
import ReadAloud from '../components/feedback/ReadAloud.jsx'
import Icon from '../components/icon/Icon.jsx'
import { attributeNames } from '../data/characterOptions.js'
import { NotFound } from './Information.jsx'

import './CharacterDetail.css'

export default function CharacterDetail({
  characters,
  onSave,
  onDelete,
  onToggleFavorite,
  preferences
}) {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const cancelButton = useRef(null)
  const deleteButton = useRef(null)
  const confirmationTitle = useId()

  const character = characters.find(
    item => String(item.id) === String(id)
  )

  const returnTo =
    typeof state?.returnTo === 'string' &&
      (
        state.returnTo === '/inicio' ||
        /^\/biblioteca(?:\?|$)/.test(state.returnTo)
      )
      ? state.returnTo
      : '/biblioteca'

  const libraryReturn = returnTo.startsWith('/biblioteca')
    ? returnTo
    : '/biblioteca'

  useEffect(() => {
    if (confirmDelete) {
      cancelButton.current?.focus()
    }
  }, [confirmDelete])

  if (!character) {
    return <NotFound />
  }

  async function ejecutar(accion) {
    if (pending) return

    setPending(true)
    setError('')

    try {
      await accion()
    } catch (failure) {
      setError(
        failure.message ||
        'No se pudo completar la operación.'
      )
    } finally {
      setPending(false)
    }
  }

  function cancelarEliminacion() {
    if (pending) return

    setConfirmDelete(false)

    requestAnimationFrame(() => {
      deleteButton.current?.focus()
    })
  }

  async function duplicar() {
    await ejecutar(async () => {
      const copia = await onSave({
        ...character,
        id: undefined,
        name: `${character.name.slice(0, 42)} (copia)`,
        favorite: false
      })

      navigate(libraryReturn, {
        state: {
          message: `${copia.name}: personaje duplicado.`
        }
      })
    })
  }

  async function eliminar() {
    await ejecutar(async () => {
      await onDelete(character.id)

      navigate(libraryReturn, {
        replace: true,
        state: {
          message: `${character.name}: personaje eliminado.`
        }
      })
    })
  }

  async function cambiarFavorito() {
    await ejecutar(async () => {
      await onToggleFavorite(character.id)
    })
  }

  const readingText = [
    character.name,
    `${character.race}. ${character.type}. Nivel ${character.level}`,
    character.realm,
    character.story,
    `Rasgos: ${character.traits.join(', ')}`,
    ...attributeNames.map(
      (name, index) =>
        `${name}: ${character.stats[index]}`
    )
  ].filter(Boolean).join('. ')

  return (
    <article
      className="character-detail"
      aria-label={`Ficha de ${character.name}`}
      aria-busy={pending}
    >
      <Link
        className="secondary-button character-back"
        to={returnTo}
      >
        <Icon name="back" size={18} />

        {returnTo === '/inicio'
          ? 'Volver a Inicio'
          : 'Volver a Biblioteca'}
      </Link>

      <Portrait character={character} />

      <p className="character-detail-summary">
        {character.race} · {character.type} · Nivel {character.level}
      </p>

      <p className="character-detail-origin">
        Visibilidad:{' '}
        {character.visibility === 'publico'
          ? 'Público'
          : 'Privado'}
      </p>

      {character.realm && (
        <p className="character-detail-origin">
          {character.realm}
        </p>
      )}

      <section
        className="character-detail-section"
        aria-labelledby="character-story-title"
      >
        <h2 id="character-story-title">Historia</h2>

        <p className="character-story">
          {character.story || 'Esta historia está por escribir.'}
        </p>
      </section>

      {character.personality && (
        <section className="character-detail-section">
          <h2>Personalidad</h2>
          <p className="character-story">
            {character.personality}
          </p>
        </section>
      )}

      {preferences.readAloud && (
        <ReadAloud
          text={readingText}
          rate={preferences.readingRate}
        />
      )}

      {character.traits.length > 0 && (
        <section
          className="character-detail-section"
          aria-labelledby="character-traits-title"
        >
          <h2 id="character-traits-title">Rasgos</h2>

          <ul className="trait-list">
            {character.traits.map(trait => (
              <li key={trait}>{trait}</li>
            ))}
          </ul>
        </section>
      )}

      <section
        className="character-detail-section"
        aria-labelledby="character-stats-title"
      >
        <h2 id="character-stats-title">Atributos</h2>

        <dl className="attribute-grid">
          {attributeNames.map((name, index) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{character.stats[index]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="action-stack">
        <button
          className="secondary-button"
          type="button"
          disabled={pending}
          aria-pressed={character.favorite}
          onClick={cambiarFavorito}
        >
          {character.favorite
            ? 'Quitar de favoritos'
            : 'Guardar en favoritos'}
        </button>

        <Link
          className="primary-button"
          to={`/personaje/${encodeURIComponent(character.id)}/editar`}
          aria-disabled={pending}
          onClick={event => {
            if (pending) event.preventDefault()
          }}
        >
          Editar personaje
        </Link>

        <button
          className="secondary-button"
          type="button"
          disabled={pending}
          onClick={duplicar}
        >
          Duplicar personaje
        </button>

        {!confirmDelete && (
          <button
            ref={deleteButton}
            className="text-button danger-button"
            type="button"
            disabled={pending}
            onClick={() => {
              setError('')
              setConfirmDelete(true)
            }}
          >
            Eliminar personaje
          </button>
        )}
      </div>

      {confirmDelete && (
        <section
          className="character-delete-confirmation action-stack"
          aria-labelledby={confirmationTitle}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.stopPropagation()
              cancelarEliminacion()
            }
          }}
        >
          <h2 id={confirmationTitle}>
            ¿Eliminar a {character.name}?
          </h2>

          <p>
            El personaje se eliminará de MariaDB.
            Esta acción no se puede deshacer.
          </p>

          <button
            ref={cancelButton}
            className="secondary-button"
            type="button"
            disabled={pending}
            onClick={cancelarEliminacion}
          >
            Conservar personaje
          </button>

          <button
            className="primary-button"
            type="button"
            disabled={pending}
            onClick={eliminar}
          >
            {pending
              ? 'Eliminando...'
              : 'Eliminar definitivamente'}
          </button>
        </section>
      )}

      {pending && (
        <p role="status" aria-live="polite">
          Guardando cambios en el servidor...
        </p>
      )}

      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}
    </article>
  )
}
