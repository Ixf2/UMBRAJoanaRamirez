import { useId, useState } from 'react'
import { Link, useParams } from 'react-router'
import Icon from '../components/icon/Icon.jsx'
import ReadAloud from '../components/feedback/ReadAloud.jsx'
import { accessibilityMenus, accentColors, contrastModes, elementSizes, textSizes, themes } from '../data/accessibility.js'
import { defaultPreferences } from '../utils/preferenceStore.js'
import { NotFound } from './Information.jsx'
import './Accessibility.css'

const sample = 'Elara Valen, hechicera humana. Una guerrera marcada por la pérdida que busca una segunda oportunidad entre las sombras. Toda historia merece ser contada.'
const labelFor = (options, value) => options.find(option => option.value === value)?.label

function Choices({ name, legend, value, options, onChange }) {
  const id = useId()
  return <fieldset className="settings-choices"><legend>{legend}</legend>
    {options.map(option => <label className={`choice-card${value === option.value ? ' is-selected' : ''}`} key={option.value}>
      <input id={`${id}-${option.value}`} type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
      {option.color && <span className="color-swatch" style={{ backgroundColor: option.color }} aria-hidden="true" />}
      <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
      {value === option.value && <Icon name="check" size={18} />}
    </label>)}
  </fieldset>
}

function Preview() {
  return <section className="settings-preview" aria-label="Vista previa de los ajustes">
    <p className="eyebrow">VISTA PREVIA</p><h2>Elara Valen</h2>
    <p className="preview-tags">Humana · Hechicera</p>
    <p>Una guerrera marcada por la pérdida que busca una segunda oportunidad entre las sombras.</p>
    <p>Toda historia merece ser contada.</p>
  </section>
}

export default function Accessibility({ preferences, onChange, error, user }) {
  const { section } = useParams()
  const [message, setMessage] = useState('')
  const profile = user ? user.name : 'Invitado'
  const menu = accessibilityMenus.find(item => item.id === section)
  if (section && !menu) return <NotFound />

  function update(changes) {
    onChange(changes)
    setMessage(`Ajustes aplicados al perfil ${profile}.`)
  }

  const summaries = {
    texto: labelFor(textSizes, preferences.textSize), contraste: labelFor(contrastModes, preferences.contrast),
    lectura: preferences.readAloud ? 'Lectura en voz alta activada' : 'Lector del dispositivo',
    teclado: preferences.enhancedFocus ? 'Foco reforzado' : 'Foco estándar',
    apariencia: `${labelFor(themes, preferences.theme)} · ${labelFor(elementSizes, preferences.elementSize)}`,
  }

  return <section className="accessibility-page">
    {section && <Link className="settings-back" to="/accesibilidad"><Icon name="back" size={18} />Menú de accesibilidad</Link>}
    <div className="settings-profile"><Icon name="user" size={20} /><p>Ajustes de <strong>{profile}</strong><small>Cada perfil conserva su propia configuración.</small></p></div>
    {!section ? <>
      <p className="settings-description">Adapta Umbra a tu forma de leer y navegar. Elige una opción para abrir su menú.</p>
      <nav aria-label="Menú de accesibilidad" className="settings-menu">
        {accessibilityMenus.map(item => <Link className="settings-menu-item" key={item.id} to={`/accesibilidad/${item.id}`}>
          <span className="settings-icon"><Icon name={item.icon} size={25} /></span>
          <span><strong>{item.label}</strong><small>{item.description}</small><span className="settings-current">{summaries[item.id]}</span></span>
          <Icon name="chevron" size={18} />
        </Link>)}
      </nav>
      <button className="secondary-button" type="button" onClick={() => update(defaultPreferences)}>Restablecer ajustes de este perfil</button>
    </> : <>
      {section === 'texto' && <>
        <p className="settings-description">Aumenta o reduce el texto. El cambio se aplica en todas las pantallas, incluidas las fichas y los formularios.</p>
        <label className="text-size-slider">Tamaño de texto: {labelFor(textSizes, preferences.textSize)}<span><span aria-hidden="true">A</span><input type="range" name="textSizeSlider" min="0" max="3" step="1" value={textSizes.findIndex(item => item.value === preferences.textSize)} aria-valuetext={labelFor(textSizes, preferences.textSize)} onChange={event => update({ textSize: textSizes[Number(event.target.value)].value })} /><span aria-hidden="true">A</span></span></label>
        <Choices name="textSize" legend="Elige un tamaño" value={preferences.textSize} options={textSizes} onChange={textSize => update({ textSize })} />
        <Preview />
      </>}
      {section === 'contraste' && <>
        <p className="settings-description">Elige cómo distinguir el texto, los bordes y los controles. Las imágenes conservan sus colores.</p>
        <Choices name="contrast" legend="Modo de contraste" value={preferences.contrast} options={contrastModes} onChange={contrast => update({ contrast })} />
        <Preview />
        <p className="form-hint">El contraste normal utiliza el tema y el acento elegidos en Personalización visual.</p>
      </>}
      {section === 'lectura' && <>
        <p className="settings-description">Puedes usar el lector de pantalla de tu dispositivo, como TalkBack, VoiceOver o NVDA. Los controles tienen etiquetas, las imágenes tienen alternativas y los diálogos mantienen el foco.</p>
        <label className="settings-toggle"><input type="checkbox" name="announceNavigation" checked={preferences.announceNavigation} onChange={event => update({ announceNavigation: event.target.checked })} /><span>Anunciar cambios de pantalla<small>Añade un aviso con el nombre de la pantalla al navegar.</small></span></label>
        <label className="settings-toggle"><input type="checkbox" name="readAloud" checked={preferences.readAloud} onChange={event => update({ readAloud: event.target.checked })} /><span>Lectura en voz alta<small>Muestra un botón para escuchar el contenido de las fichas.</small></span></label>
        {preferences.readAloud && <>
          <label className="form-field">Velocidad de lectura<select name="readingRate" value={preferences.readingRate} onChange={event => update({ readingRate: Number(event.target.value) })}><option value={0.75}>Pausada</option><option value={1}>Normal</option><option value={1.25}>Rápida</option></select></label>
          <Preview /><ReadAloud text={sample} rate={preferences.readingRate} />
          <p className="form-hint">La voz depende de las voces disponibles en tu navegador o dispositivo y solo empieza al pulsar el botón.</p>
        </>}
      </>}
      {section === 'teclado' && <>
        <p className="settings-description">Recorre Umbra con el teclado. El foco indica qué control vas a activar.</p>
        <label className="settings-toggle"><input type="checkbox" name="enhancedFocus" checked={preferences.enhancedFocus} onChange={event => update({ enhancedFocus: event.target.checked })} /><span>Reforzar el indicador de foco<small>Aumenta el grosor y el espacio del contorno al usar el teclado.</small></span></label>
        <table className="keyboard-shortcuts"><caption>Atajos principales</caption><tbody>
          <tr><th scope="row"><kbd>Tab</kbd></th><td>Siguiente control</td></tr>
          <tr><th scope="row"><kbd>Mayús</kbd> + <kbd>Tab</kbd></th><td>Control anterior</td></tr>
          <tr><th scope="row"><kbd>Enter</kbd> / <kbd>Espacio</kbd></th><td>Activar enlaces o botones; marcar opciones</td></tr>
          <tr><th scope="row"><kbd>←</kbd> <kbd>→</kbd></th><td>Cambiar de opción en los grupos; recorrer la barra inferior</td></tr>
          <tr><th scope="row"><kbd>Inicio</kbd> / <kbd>Fin</kbd></th><td>Primer o último enlace de la barra inferior</td></tr>
          <tr><th scope="row"><kbd>Esc</kbd></th><td>Cerrar un menú o diálogo</td></tr>
        </tbody></table>
        <p className="form-hint">Al empezar con Tab aparece «Saltar al contenido». Los lectores de pantalla pueden utilizar también sus propios atajos.</p>
        <Link className="secondary-button" to="/biblioteca">Practicar en la biblioteca</Link>
      </>}
      {section === 'apariencia' && <>
        <Choices name="theme" legend="Tema" value={preferences.theme} options={themes} onChange={theme => update({ theme })} />
        <Choices name="elementSize" legend="Tamaño de elementos" value={preferences.elementSize} options={elementSizes} onChange={elementSize => update({ elementSize })} />
        <Choices name="accent" legend="Color de acento" value={preferences.accent} options={accentColors} onChange={accent => update({ accent })} />
        <label className="settings-toggle"><input type="checkbox" name="reduceMotion" checked={preferences.reduceMotion} onChange={event => update({ reduceMotion: event.target.checked })} /><span>Reducir movimiento<small>Elimina las transiciones y el movimiento de las tarjetas.</small></span></label>
        {preferences.contrast !== 'normal' && <p className="form-hint">El modo de contraste tiene prioridad sobre los colores. Tu tema y acento se conservan para cuando vuelvas al contraste normal.</p>}
        <Preview />
      </>}
    </>}
    <p className={`feedback${error ? ' error' : ''}`} role="status">{error || message || `Los ajustes de ${profile} se guardan automáticamente en este navegador.`}</p>
  </section>
}
