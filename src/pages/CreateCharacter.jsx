import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import AppForm from '../components/forms/AppForm.jsx'
import Portrait from '../components/charactercard/Portrait.jsx'
import { attributeNames, blankCharacter, characterRaces, characterTypes, personalityTraits } from '../data/characterOptions.js'
import { randomCharacter } from '../data/characters.js'
import { MAX_IMAGE_BYTES } from '../utils/characterStore.js'
import { NotFound } from './Information.jsx'

function CharacterEditor({ initial, onSave, editing }) {
  const navigate = useNavigate()
  const [image, setImage] = useState({ imageDataUrl: initial.imageDataUrl || '', imageName: initial.imageName || '' })
  const [portrait, setPortrait] = useState(initial.portrait <= 1 ? initial.portrait : 2)
  const [imageError, setImageError] = useState('')
  const [readingImage, setReadingImage] = useState(false)
  const fields = [
    { name: 'name', label: 'Nombre del personaje', required: true, minLength: 2, maxLength: 60, defaultValue: initial.name, placeholder: 'El nombre de tu leyenda' },
    { name: 'type', label: 'Clase', required: true, options: characterTypes, defaultValue: initial.type },
    { name: 'race', label: 'Raza', required: true, options: characterRaces, defaultValue: initial.race },
    { name: 'level', label: 'Nivel', type: 'number', required: true, min: 1, max: 20, defaultValue: initial.level, hint: 'Un número entero entre 1 y 20.' },
    { name: 'realm', label: 'Reino u origen', maxLength: 100, defaultValue: initial.realm },
    { name: 'story', label: 'Historia', type: 'textarea', maxLength: 3000, defaultValue: initial.story, placeholder: 'Toda leyenda tiene un comienzo…' },
    ...attributeNames.map((label, index) => ({ name: `stat${index}`, label, type: 'number', required: true, min: 1, max: 20, defaultValue: initial.stats[index], hint: 'Entre 1 y 20.' })),
  ]

  async function upload(event) {
    const file = event.target.files[0]
    if (!file) return
    setImageError('')
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      setImageError('Selecciona una imagen PNG, JPG o WebP de hasta 750 KB.')
      event.target.value = ''
      return
    }
    setReadingImage(true)
    try {
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('No se pudo leer el retrato.'))
        reader.readAsDataURL(file)
      })
      await new Promise((resolve, reject) => {
        const preview = new Image()
        preview.onload = resolve
        preview.onerror = () => reject(new Error('El archivo no contiene una imagen válida.'))
        preview.src = imageDataUrl
      })
      setImage({ imageDataUrl, imageName: file.name })
    } catch (error) { setImageError(error.message) }
    finally { setReadingImage(false) }
  }

  function submit(values) {
    if (readingImage) throw new Error('Espera a que termine de cargarse el retrato.')
    const character = onSave({
      ...initial, ...image, portrait,
      name: values.get('name'), type: values.get('type'), race: values.get('race'),
      level: Number(values.get('level')), realm: values.get('realm'), story: values.get('story'),
      stats: attributeNames.map((_, index) => Number(values.get(`stat${index}`))), traits: values.getAll('traits'),
    })
    navigate('/biblioteca', { state: { message: `${character.name}: ${editing ? 'cambios guardados' : 'personaje creado'}.` } })
  }

  return <AppForm fields={fields} submitLabel={editing ? 'Guardar cambios' : 'Guardar personaje'} onSubmit={submit} cancelTo="/biblioteca">
    <fieldset className="traits-field"><legend>Rasgos de personalidad (hasta 6)</legend><div className="traits-grid">{[...new Set([...personalityTraits, ...initial.traits])].map(trait => <label className="checkbox-label" key={trait}><input type="checkbox" name="traits" value={trait} defaultChecked={initial.traits.includes(trait)} />{trait}</label>)}</div></fieldset>
    <div className="portrait-editor">
      <h2>Retrato</h2>
      <Portrait character={{ ...initial, ...image, portrait, name: initial.name || 'tu personaje' }} />
      <label>Estilo de retrato<select value={portrait} onChange={event => { setPortrait(Number(event.target.value)); setImage({ imageDataUrl: '', imageName: '' }) }}><option value={0}>Hechicera</option><option value={1}>Pícaro</option><option value={2}>Iniciales del personaje</option></select></label>
      <label>Subir imagen<input type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={readingImage} /></label>
      <p className="form-hint">PNG, JPG o WebP. Máximo 750 KB.{image.imageName && ` Imagen: ${image.imageName}`}</p>
      {readingImage && <p role="status">Cargando retrato…</p>}
      {image.imageDataUrl && <button type="button" className="secondary-button" onClick={() => setImage({ imageDataUrl: '', imageName: '' })}>Quitar imagen subida</button>}
      {imageError && <p className="field-error" role="alert">{imageError}</p>}
    </div>
  </AppForm>
}

export default function CreateCharacter({ characters, onSave }) {
  const { id } = useParams()
  const { state } = useLocation()
  const [draft, setDraft] = useState(() => ({ ...blankCharacter(), ...state?.draft, id: undefined }))
  const [revision, setRevision] = useState(0)
  const initial = id ? characters.find(character => character.id === id) : draft
  if (!initial) return <NotFound />

  return <section className="editor-page">
    {!id && <button type="button" className="secondary-button random-button" onClick={() => { setDraft({ ...randomCharacter(), id: undefined }); setRevision(value => value + 1) }}>Generar personaje aleatorio</button>}
    <CharacterEditor key={`${id || 'new'}-${revision}`} initial={initial} onSave={onSave} editing={Boolean(id)} />
  </section>
}
