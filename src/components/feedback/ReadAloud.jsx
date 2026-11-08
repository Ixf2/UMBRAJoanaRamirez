import { useEffect, useRef, useState } from 'react'
import Icon from '../icon/Icon.jsx'

export default function ReadAloud({ text, rate = 1 }) {
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const current = useRef(null)
  const [reading, setReading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => {
    if (current.current) {
      current.current.onend = null
      current.current.onerror = null
      window.speechSynthesis.cancel()
    }
  }, [])

  function toggle() {
    if (reading) {
      window.speechSynthesis.cancel()
      current.current = null
      setReading(false)
      return
    }
    setError('')
    window.speechSynthesis.cancel()
    const speech = new SpeechSynthesisUtterance(text)
    speech.lang = 'es-ES'
    speech.rate = rate
    const voice = window.speechSynthesis.getVoices().find(item => item.lang.startsWith('es'))
    if (voice) speech.voice = voice
    speech.onend = () => { current.current = null; setReading(false) }
    speech.onerror = event => {
      current.current = null
      setReading(false)
      if (!['canceled', 'interrupted'].includes(event.error)) setError('No se pudo reproducir la voz. Comprueba que el dispositivo tenga una voz en español disponible.')
    }
    current.current = speech
    setReading(true)
    window.speechSynthesis.speak(speech)
  }

  if (!supported) return <p className="form-hint">Este navegador no ofrece lectura en voz alta. Puedes utilizar el lector de pantalla de tu dispositivo.</p>
  return <div className="read-aloud">
    <button className="secondary-button" type="button" onClick={toggle} aria-pressed={reading}><Icon name="speaker" />{reading ? 'Detener lectura' : 'Leer en voz alta'}</button>
    {error && <p className="feedback error" role="alert">{error}</p>}
  </div>
}
