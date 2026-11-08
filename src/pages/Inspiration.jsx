import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import Icon from '../components/icon/Icon.jsx'
import Portrait from '../components/charactercard/Portrait.jsx'
import ReadAloud from '../components/feedback/ReadAloud.jsx'
import { attributeNames, characterRaces, characterTypes, personalityTraits } from '../data/characterOptions.js'
import { inspirationFields } from '../data/inspiration.js'
import { randomCharacter } from '../utils/generateCharacter.js'
import { readPortrait } from '../utils/readPortrait.js'
import { validateForm } from '../utils/validateForm.js'
import './Inspiration.css'

const fields = [
  { name: 'name', label: 'Nombre', required: true, minLength: 2, maxLength: 60 },
  { name: 'type', label: 'Clase', required: true, options: characterTypes },
  { name: 'race', label: 'Raza', required: true, options: characterRaces },
  { name: 'level', label: 'Nivel', type: 'number', required: true, min: 1, max: 20 },
  { name: 'realm', label: 'Origen', maxLength: 100 },
  { name: 'story', label: 'Historia', maxLength: 3000 },
  ...attributeNames.map((label, index) => ({ name: `stat${index}`, label, type: 'number', required: true, min: 1, max: 20 })),
]

function Field({ field, locked, onLock, onChange, onEditEnd, error, children, className = '' }) {
  const label = inspirationFields.find(item => item.key === field).label
  return <section className={`inspiration-field ${className}`} data-field={field} data-locked={locked} aria-labelledby={`inspiration-${field}-title`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) onEditEnd(field) }}>
    <div className="inspiration-field-heading">
      <h3 id={`inspiration-${field}-title`}>{label}{locked && <span className="inspiration-fixed">Fijado</span>}</h3>
      <div className="inspiration-field-actions">
        <button className="icon-button" type="button" aria-label={`${locked ? 'Desbloquear' : 'Fijar'} ${label.toLocaleLowerCase('es')}`} aria-pressed={locked} title={locked ? `Desbloquear ${label.toLocaleLowerCase('es')}` : `Conservar ${label.toLocaleLowerCase('es')} al generar otra idea`} onClick={() => onLock(field)}><Icon name={locked ? 'lock' : 'unlock'} size={17} /></button>
        <button className="icon-button" type="button" aria-label={`Cambiar ${label.toLocaleLowerCase('es')}`} title={locked ? 'Desbloquea este campo para cambiarlo' : `Generar ${label.toLocaleLowerCase('es')}`} disabled={locked} onClick={() => onChange(field)}><Icon name="dice" size={19} /></button>
      </div>
    </div>
    {children}
    {error && <p className="field-error" id={`inspiration-${field}-error`}>{error}</p>}
  </section>
}

export default function Inspiration({ preferences, onSave }) {
  const navigate = useNavigate()
  const form = useRef(null)
  const saveInProgress = useRef(false)
  const [editingField, setEditingField] = useState(null)
  const [character, setCharacter] = useState(() => randomCharacter())
  const [lockedFields, setLockedFields] = useState([])
  const [history, setHistory] = useState([])
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [customTrait, setCustomTrait] = useState('')
  const [traitError, setTraitError] = useState('')
  const [imageError, setImageError] = useState('')
  const [readingImage, setReadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const allLocked = lockedFields.length === inspirationFields.length
  const values = new Map(fields.map(field => [field.name, String(field.name.startsWith('stat') ? character.stats[Number(field.name.slice(4))] : character[field.name])]))
  const errors = validateForm(fields, values)

  function remember() {
    setHistory(previous => [...previous.slice(-9), character])
  }

  function edit(field, changes) {
    if (editingField !== field) {
      remember()
      setEditingField(field)
    }
    setCharacter(previous => ({ ...previous, ...changes }))
    setLockedFields(previous => previous.includes(field) ? previous : [...previous, field])
    setSubmitted(false)
    if (field === 'portrait') setImageError('')
  }

  function finishEditing(field) {
    if (editingField !== field) return
    setEditingField(null)
    const label = inspirationFields.find(item => item.key === field).label
    setMessage(`${label} editado y fijado. Puedes desbloquearlo para volver a generarlo.`)
  }

  function generate(field) {
    const preserve = field ? inspirationFields.filter(item => item.key !== field).map(item => item.key) : lockedFields
    const next = randomCharacter(character, preserve)
    remember()
    setEditingField(null)
    setCharacter(next)
    setSubmitted(false)
    const label = inspirationFields.find(item => item.key === field)?.label
    setMessage(field ? `${label}: nueva propuesta generada.` : `Nueva inspiración: ${next.name}. ${lockedFields.length ? 'Se han conservado los campos fijados.' : 'Todos los campos tienen una nueva combinación.'}`)
  }

  function toggleLock(field) {
    const label = inspirationFields.find(item => item.key === field).label
    setLockedFields(previous => previous.includes(field) ? previous.filter(item => item !== field) : [...previous, field])
    setMessage(`${label}: ${lockedFields.includes(field) ? 'desbloqueado' : 'se conservará al generar otra idea'}.`)
  }

  function undo() {
    const previous = history.at(-1)
    if (!previous) return
    setCharacter(previous)
    setEditingField(null)
    setSubmitted(false)
    setImageError('')
    setHistory(items => items.slice(0, -1))
    setMessage(`Idea anterior recuperada: ${previous.name}.`)
  }

  async function upload(event) {
    const input = event.currentTarget
    const file = input.files[0]
    if (!file) return
    setImageError('')
    setReadingImage(true)
    try {
      edit('portrait', await readPortrait(file))
      setMessage('Retrato actualizado y fijado.')
    } catch (failure) { setImageError(failure.message) }
    finally { input.value = ''; setReadingImage(false) }
  }

  function toggleTrait(trait) {
    const selected = character.traits.includes(trait)
    if (!selected && character.traits.length >= 6) return
    edit('traits', { traits: selected ? character.traits.filter(item => item !== trait) : [...character.traits, trait] })
    setTraitError('')
  }

  function addTrait() {
    const trait = customTrait.trim()
    if (!trait) return
    if (character.traits.some(item => item.toLocaleLowerCase('es') === trait.toLocaleLowerCase('es'))) {
      setTraitError('Ese rasgo ya está seleccionado.')
      return
    }
    if (character.traits.length >= 6) { setTraitError('Puedes elegir hasta seis rasgos.'); return }
    edit('traits', { traits: [...character.traits, trait] })
    setCustomTrait('')
    setTraitError('')
  }

  async function handleSave(event) {
    event.preventDefault()
    if (readingImage || saveInProgress.current) return
    setSaveError('')
    if (Object.keys(errors).length) {
      setSubmitted(true)
      requestAnimationFrame(() => {
        const invalid = form.current?.querySelector('[aria-invalid="true"]')
        invalid?.focus()
        invalid?.scrollIntoView({ block: 'center' })
      })
      return
    }
    saveInProgress.current = true
    setSaving(true)
    try {
      const saved = await onSave({ ...character, id: undefined, name: character.name.trim(), level: Number(character.level), stats: character.stats.map(Number) })
      navigate('/biblioteca', { state: { message: `${saved.name}: personaje guardado desde Inspiración.` } })
    } catch (failure) {
      setSaveError(failure?.message || 'No se pudo guardar el personaje. Vuelve a intentarlo.')
    } finally {
      saveInProgress.current = false
      setSaving(false)
    }
  }

  const fieldProps = field => ({ field, locked: lockedFields.includes(field), onLock: toggleLock, onChange: () => generate(field), onEditEnd: () => finishEditing(field), error: errors[field] })
  const inputProps = name => ({ id: `inspiration-input-${name}`, name, 'aria-labelledby': `inspiration-${name}-title`, 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `inspiration-${name}-error` : undefined })
  const readingText = [character.name, character.type, character.race, `Nivel ${character.level}`, character.realm, character.story, `Rasgos: ${character.traits.join(', ')}`, ...attributeNames.map((name, index) => `${name}: ${character.stats[index]}`)].join('. ')

  return <form ref={form} className="inspiration-page" noValidate onSubmit={handleSave}>
    <fieldset className="form-contents" disabled={readingImage || saving} aria-label="Generador y edición del personaje">
    <section className="inspiration-intro" aria-labelledby="inspiration-title">
      <span className="inspiration-emblem" aria-hidden="true"><Icon name="dice" size={32} /></span>
      <p className="eyebrow">EL AZAR TIENE UNA HISTORIA</p>
      <h2 id="inspiration-title">Una chispa.<br />Mil posibles leyendas.</h2>
      <p>Genera una ficha y edita cualquier campo aquí mismo. Lo que escribas quedará fijado para conservarlo.</p>
    </section>

    <div className="inspiration-toolbar">
      <button className="primary-button" type="button" onClick={() => generate()} disabled={allLocked} aria-describedby="inspiration-lock-hint"><Icon name="dice" size={20} />Otra inspiración</button>
      <button className="secondary-button inspiration-undo" type="button" onClick={undo} disabled={!history.length} aria-label="Recuperar idea anterior" title="Recuperar idea anterior"><Icon name="undo" size={20} /></button>
    </div>
    <div className="inspiration-guidance">
      <p id="inspiration-lock-hint">{allLocked ? 'Todos los campos están fijados. Puedes seguir editándolos o desbloquear alguno para volver a generar.' : 'Escribe directamente para editar. El dado genera otro valor y el candado lo conserva.'}</p>
      {lockedFields.length > 0 && <button className="text-button" type="button" onClick={() => { setLockedFields([]); setMessage('Todos los campos están desbloqueados.') }}>Quitar bloqueos ({lockedFields.length})</button>}
    </div>
    <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{message}</p>

    <article className="inspiration-draft" aria-label={`Borrador de ${character.name || 'tu personaje'}`}>
      <div className="inspiration-draft-heading"><h2 className="eyebrow">TU PRÓXIMO PERSONAJE</h2><span className="inspiration-draft-badge">Sin guardar</span></div>
      <div className="inspiration-portrait-card">
        <Field {...fieldProps('portrait')}>
          <Portrait character={{ ...character, name: character.name || 'tu personaje' }} />
          <p className="inspiration-portrait-caption">{character.imageDataUrl ? character.imageName : ['Retrato de hechicera', 'Retrato de pícaro', 'Iniciales del personaje'][character.portrait]}</p>
          <label className="inspiration-input-label" htmlFor="inspiration-portrait">Estilo de retrato</label>
          <select id="inspiration-portrait" name="portrait" value={character.portrait} onChange={event => edit('portrait', { portrait: Number(event.target.value), imageDataUrl: '', imageName: '' })}><option value={0}>Hechicera</option><option value={1}>Pícaro</option><option value={2}>Iniciales</option></select>
          <label className="inspiration-input-label" htmlFor="inspiration-image">Subir tu imagen</label>
          <input id="inspiration-image" name="portraitFile" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} aria-describedby="inspiration-image-hint" />
          <p className="form-hint" id="inspiration-image-hint">PNG, JPG o WebP. Hasta 750 KB.</p>
          {character.imageDataUrl && <button className="secondary-button" type="button" onClick={() => edit('portrait', { imageDataUrl: '', imageName: '' })}>Quitar imagen subida</button>}
          {imageError && <p className="field-error" role="alert">{imageError}</p>}
        </Field>
        <Field {...fieldProps('name')}><input {...inputProps('name')} className="inspiration-name" type="text" required minLength={2} maxLength={60} value={character.name} onChange={event => edit('name', { name: event.target.value })} /></Field>
      </div>

      <div className="inspiration-fields">
        <Field {...fieldProps('type')}><select {...inputProps('type')} className="inspiration-value" value={character.type} onChange={event => edit('type', { type: event.target.value })}>{characterTypes.map(type => <option key={type}>{type}</option>)}</select></Field>
        <Field {...fieldProps('race')}><select {...inputProps('race')} className="inspiration-value" value={character.race} onChange={event => edit('race', { race: event.target.value })}>{characterRaces.map(race => <option key={race}>{race}</option>)}</select></Field>
        <Field {...fieldProps('level')}><div className="inspiration-number"><input {...inputProps('level')} type="number" min={1} max={20} step={1} required value={character.level} onChange={event => edit('level', { level: event.target.value })} /><span aria-hidden="true">/ 20</span></div></Field>
        <Field {...fieldProps('realm')}><input {...inputProps('realm')} className="inspiration-value" type="text" maxLength={100} value={character.realm} onChange={event => edit('realm', { realm: event.target.value })} /></Field>
      </div>

      <Field {...fieldProps('traits')}>
        <ul className="trait-list inspiration-traits">{character.traits.map(trait => <li key={trait}><button type="button" aria-label={`Quitar rasgo ${trait}`} onClick={() => toggleTrait(trait)}>{trait}<Icon name="close" size={13} /></button></li>)}</ul>
        <details className="inspiration-trait-picker"><summary>Elegir rasgos ({character.traits.length}/6)</summary><div className="inspiration-trait-options">{[...new Set([...personalityTraits, ...character.traits])].map(trait => <label className="checkbox-label" key={trait}><input type="checkbox" name="traits" value={trait} checked={character.traits.includes(trait)} disabled={character.traits.length >= 6 && !character.traits.includes(trait)} onChange={() => toggleTrait(trait)} />{trait}</label>)}</div></details>
        <label className="inspiration-input-label" htmlFor="inspiration-custom-trait">Añadir un rasgo propio</label>
        <div className="inspiration-add-trait"><input id="inspiration-custom-trait" name="customTrait" type="text" maxLength={40} value={customTrait} placeholder="Por ejemplo, Curiosa" onChange={event => { setCustomTrait(event.target.value); setTraitError('') }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addTrait() } }} aria-describedby="inspiration-traits-hint" /><button className="secondary-button" type="button" disabled={!customTrait.trim() || character.traits.length >= 6} onClick={addTrait}>Añadir</button></div>
        <p className="form-hint" id="inspiration-traits-hint">Hasta seis rasgos. Pulsa un rasgo seleccionado para quitarlo.</p>
        {traitError && <p className="field-error" role="alert">{traitError}</p>}
      </Field>
      <Field {...fieldProps('stats')}>
        <dl className="inspiration-stats">{attributeNames.map((name, index) => <div className="inspiration-stat" key={name}><dt><label htmlFor={`inspiration-stat${index}`}>{name}</label></dt><dd><div className="inspiration-number"><input id={`inspiration-stat${index}`} name={`stat${index}`} type="number" min={1} max={20} step={1} required value={character.stats[index]} onChange={event => edit('stats', { stats: character.stats.map((stat, position) => position === index ? event.target.value : stat) })} aria-invalid={Boolean(errors[`stat${index}`])} aria-describedby={errors[`stat${index}`] ? `inspiration-stat${index}-error` : undefined} /><span aria-hidden="true">/ 20</span></div>{errors[`stat${index}`] && <p className="field-error" id={`inspiration-stat${index}-error`}>{errors[`stat${index}`]}</p>}</dd><div className="inspiration-stat-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(20, Number(character.stats[index]) || 0)) / 20 * 100}%` }} /></div></div>)}</dl>
      </Field>
      <Field {...fieldProps('story')}><textarea {...inputProps('story')} className="inspiration-story" rows={7} maxLength={3000} value={character.story} onChange={event => edit('story', { story: event.target.value })} /><p className="form-hint">{character.story.length}/3000 caracteres</p></Field>
      {preferences.readAloud && <ReadAloud key={readingText} text={readingText} rate={preferences.readingRate} />}
    </article>
    </fieldset>

    <div className="inspiration-create">
      {readingImage && <p className="feedback" role="status">Cargando retrato…</p>}
      {submitted && Object.keys(errors).length > 0 && <p className="feedback error" role="alert">Revisa los campos indicados antes de guardar.</p>}
      {saveError && <p className="feedback error" role="alert">{saveError}</p>}
      <button className="primary-button" type="submit" disabled={readingImage || saving}><Icon name="book" size={18} />{saving ? 'Guardando…' : 'Guardar personaje'}</button>
      <p>El personaje se guardará directamente en la biblioteca de este perfil.</p>
    </div>
  </form>
}
