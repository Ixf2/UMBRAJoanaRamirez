
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import AppForm from '../components/forms/AppForm.jsx'
import Portrait from '../components/charactercard/Portrait.jsx'
import {
  attributeNames,
  blankCharacter,
  characterRaces,
  characterTypes,
  personalityTraits
} from '../data/characterOptions.js'
import { randomCharacter } from '../utils/generateCharacter.js'
import { readPortrait } from '../utils/readPortrait.js'
import { NotFound } from './Information.jsx'

function CharacterEditor({ initial, onSave, editing }) {
  const navigate = useNavigate()

  const [image, setImage] = useState({
    imageDataUrl: initial.imageDataUrl || '',
    imageName: initial.imageName || ''
  })

  const [imageFile, setImageFile] = useState(null)
  const [portrait, setPortrait] = useState(Number(initial.portrait ?? 2))
  const [imageError, setImageError] = useState('')
  const [readingImage, setReadingImage] = useState(false)

  
const fields = [
  {
    name: 'name',
    label: 'Nombre del personaje',
    required: true,
    minLength: 2,
    maxLength: 50,
    defaultValue: initial.name || '',
    placeholder: 'Nombre de tu personaje'
  },
  {
    name: 'type',
    label: 'Clase',
    required: true,
    options: characterTypes,
    defaultValue: initial.type || 'Guerrero'
  },
  {
    name: 'race',
    label: 'Raza',
    required: true,
    options: characterRaces,
    defaultValue: initial.race || 'Humana'
  },
  {
    name: 'level',
    label: 'Nivel',
    type: 'number',
    required: true,
    min: 1,
    max: 20,
    defaultValue: initial.level ?? 1
  },
  {
    name: 'realm',
    label: 'Reino u origen',
    maxLength: 100,
    defaultValue: initial.realm || ''
  },
  {
    name: 'story',
    label: 'Historia',
    type: 'textarea',
    required: true,
    maxLength: 3000,
    defaultValue: initial.story || '',
    placeholder: 'Cuenta la historia de tu personaje'
  },
  {
    name: 'personality',
    label: 'Personalidad',
    type: 'textarea',
    required: true,
    maxLength: 3000,
    defaultValue: initial.personality || '',
    placeholder: 'Describe la personalidad del personaje'
  },
  {
    name: 'visibility',
    label: 'Visibilidad',
    required: true,
    options: ['privado', 'publico'],
    defaultValue: initial.visibility || 'privado'
  },
  ...attributeNames.map((label, index) => ({
    name: `stat${index}`,
    label,
    type: 'number',
    required: true,
    min: 1,
    max: 20,
    defaultValue: initial.stats[index],
    hint: 'Entre 1 y 20.'
  }))
]


  async function upload(event) {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) return

    setImageError('')
    setReadingImage(true)

    try {
      const preview = await readPortrait(file)
      setImage(preview)
      setImageFile(file)
    } catch (error) {
      setImageError(error.message)
      input.value = ''
    } finally {
      setReadingImage(false)
    }
  }

  function changePortrait(value) {
    setPortrait(Number(value))
    setImageFile(null)
    setImage({
      imageDataUrl: '',
      imageName: ''
    })
    setImageError('')
  }

  function clearImage() {
    setImageFile(null)
    setImage({
      imageDataUrl: '',
      imageName: ''
    })
    setImageError('')
  }

  async function submit(values) {
    if (readingImage) {
      throw new Error('Espera a que termine de cargarse el retrato.')
    }

    const traits = values.getAll('traits')

    if (traits.length > 6) {
      throw new Error('Puedes seleccionar como máximo seis rasgos.')
    }

    const character = await onSave({
      ...initial,
      ...image,
      portrait,
      name: values.get('name').trim(),
      type: values.get('type'),
      race: values.get('race'),
      level: Number(values.get('level')),
      realm: values.get('realm').trim(),
      story: values.get('story').trim(),
      personality: values.get('personality').trim(),
      visibility: values.get('visibility'),
      stats: attributeNames.map((_, index) =>
        Number(values.get(`stat${index}`))
      ),
      traits
    }, imageFile)

    navigate('/biblioteca', {
      state: {
        message: `${character.name}: ${
          editing
            ? 'cambios guardados en MariaDB'
            : 'personaje creado en MariaDB'
        }.`
      }
    })
  }

  return (
    <AppForm
      fields={fields}
      submitLabel={editing ? 'Guardar cambios' : 'Guardar personaje'}
      onSubmit={submit}
      cancelTo="/biblioteca"
    >
      <fieldset className="traits-field">
        <legend>Rasgos de personalidad (hasta 6)</legend>

        <div className="traits-grid">
          {[
            ...new Set([
              ...personalityTraits,
              ...(initial.traits || [])
            ])
          ].map(trait => (
            <label className="checkbox-label" key={trait}>
              <input
                type="checkbox"
                name="traits"
                value={trait}
                defaultChecked={(initial.traits || []).includes(trait)}
              />
              {trait}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="portrait-editor">
        <h2>Retrato</h2>

        <Portrait
          character={{
            ...initial,
            ...image,
            portrait,
            image: imageFile ? '' : initial.image,
            name: initial.name || 'tu personaje'
          }}
        />

        <label>
          Estilo de retrato
          <select
            value={portrait}
            onChange={event => changePortrait(event.target.value)}
          >
            <option value={0}>Hechicera</option>
            <option value={1}>Pícaro</option>
            <option value={2}>Iniciales del personaje</option>
          </select>
        </label>

        <label>
          Subir imagen
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={upload}
            disabled={readingImage}
          />
        </label>

        <p className="form-hint">
          PNG, JPG o WebP. Máximo 750 KB.
        </p>

        {image.imageName && (
          <p className="form-hint">
            Imagen seleccionada: {image.imageName}
          </p>
        )}

        {readingImage && (
          <p role="status">
            Cargando retrato…
          </p>
        )}

        {imageFile && (
          <button
            type="button"
            className="secondary-button"
            onClick={clearImage}
          >
            Quitar imagen seleccionada
          </button>
        )}

        {imageError && (
          <p className="field-error" role="alert">
            {imageError}
          </p>
        )}
      </div>
    </AppForm>
  )
}

export default function CreateCharacter({ characters, onSave }) {
  const { id } = useParams()
  const { state } = useLocation()

  const [draft, setDraft] = useState(() => ({
    ...blankCharacter(),
    ...state?.draft,
    id: undefined,
    personality: state?.draft?.personality || '',
    visibility: state?.draft?.visibility || 'privado',
    idCategoria: state?.draft?.idCategoria || 1
  }))

  const [revision, setRevision] = useState(0)

  const initial = id
    ? characters.find(character => String(character.id) === String(id))
    : draft

  if (!initial) return <NotFound />

  
function generateRandom() {
  setDraft({
    ...randomCharacter(),
    id: undefined,
    visibility: 'privado',
    idCategoria: 1
  })

  setRevision(value => value + 1)
}


  return (
    <section className="editor-page">
      {!id && (
        <button
          type="button"
          className="secondary-button random-button"
          onClick={generateRandom}
        >
          Generar personaje aleatorio
        </button>
      )}

      <CharacterEditor
        key={`${id || 'new'}-${revision}`}
        initial={initial}
        onSave={onSave}
        editing={Boolean(id)}
      />
    </section>
  )
}
