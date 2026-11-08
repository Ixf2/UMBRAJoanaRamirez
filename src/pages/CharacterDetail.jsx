import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import Portrait from '../components/charactercard/Portrait.jsx'
import ReadAloud from '../components/feedback/ReadAloud.jsx'
import Icon from '../components/icon/Icon.jsx'
import { attributeNames } from '../data/characterOptions.js'
import { NotFound } from './Information.jsx'
import './CharacterDetail.css'

export default function CharacterDetail({ characters, onSave, onDelete, onToggleFavorite, preferences }) {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cancelButton = useRef(null)
  const deleteButton = useRef(null)
  const confirmationTitle = useId()
  const character = characters.find(item => item.id === id)
  const returnTo = typeof state?.returnTo === 'string' && (state.returnTo === '/inicio' || /^\/biblioteca(?:\?|$)/.test(state.returnTo)) ? state.returnTo : '/biblioteca'
  const libraryReturn = returnTo.startsWith('/biblioteca') ? returnTo : '/biblioteca'

  useEffect(() => {
    if (confirmDelete) cancelButton.current?.focus()
  }, [confirmDelete])

  if (!character) return <NotFound />

  function act(action) {
    try { action(); setError('') }
    catch (failure) { setError(failure.message) }
  }

  function cancelDelete() {
    setConfirmDelete(false)
    requestAnimationFrame(() => deleteButton.current?.focus())
  }

  function duplicate() {
    const copy = onSave({ ...character, id: undefined, name: `${character.name.slice(0, 52)} (copia)`, favorite: false })
    navigate(libraryReturn, { state: { message: `${copy.name}: personaje duplicado.` } })
  }

  function remove() {
    onDelete(character.id)
    navigate(libraryReturn, { replace: true, state: { message: `${character.name}: personaje eliminado.` } })
  }

  const readingText = [character.name, `${character.race}. ${character.type}. Nivel ${character.level}`, character.realm, character.story, `Rasgos: ${character.traits.join(', ')}`, ...attributeNames.map((name, index) => `${name}: ${character.stats[index]}`)].filter(Boolean).join('. ')

  return <article className="character-detail" aria-label={`Ficha de ${character.name}`}>
    <Link className="secondary-button character-back" to={returnTo}><Icon name="back" size={18} />{returnTo === '/inicio' ? 'Volver a Inicio' : 'Volver a Biblioteca'}</Link>
    <Portrait character={character} />
    <p className="character-detail-summary">{character.race} · {character.type} · Nivel {character.level}</p>
    {character.realm && <p className="character-detail-origin">{character.realm}</p>}
    <section className="character-detail-section" aria-labelledby="character-story-title">
      <h2 id="character-story-title">Historia</h2>
      <p className="character-story">{character.story || 'Esta historia está por escribir.'}</p>
    </section>
    {preferences.readAloud && <ReadAloud text={readingText} rate={preferences.readingRate} />}
    {character.traits.length > 0 && <section className="character-detail-section" aria-labelledby="character-traits-title"><h2 id="character-traits-title">Rasgos</h2><ul className="trait-list">{character.traits.map(trait => <li key={trait}>{trait}</li>)}</ul></section>}
    <section className="character-detail-section" aria-labelledby="character-stats-title"><h2 id="character-stats-title">Atributos</h2><dl className="attribute-grid">{attributeNames.map((name, index) => <div key={name}><dt>{name}</dt><dd>{character.stats[index]}</dd></div>)}</dl></section>
    <div className="action-stack">
      <button className="secondary-button" type="button" aria-pressed={character.favorite} onClick={() => act(() => onToggleFavorite(character.id))}>{character.favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}</button>
      <Link className="primary-button" to={`/personaje/${encodeURIComponent(character.id)}/editar`}>Editar personaje</Link>
      <button className="secondary-button" type="button" onClick={() => act(duplicate)}>Duplicar personaje</button>
      {!confirmDelete && <button ref={deleteButton} className="text-button danger-button" type="button" onClick={() => { setError(''); setConfirmDelete(true) }}>Eliminar personaje</button>}
    </div>
    {confirmDelete && <section className="character-delete-confirmation action-stack" aria-labelledby={confirmationTitle} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); cancelDelete() } }}>
      <h2 id={confirmationTitle}>¿Eliminar a {character.name}?</h2>
      <p>La ficha se eliminará de esta biblioteca. Esta acción no se puede deshacer.</p>
      <button ref={cancelButton} className="secondary-button" type="button" onClick={cancelDelete}>Conservar personaje</button>
      <button className="primary-button" type="button" onClick={() => act(remove)}>Eliminar definitivamente</button>
    </section>}
    {error && <p className="feedback error" role="alert">{error}</p>}
  </article>
}
