import { useState } from 'react'
import { Link } from 'react-router'
import Icon from '../components/icon/Icon.jsx'
import Modal from '../components/modal/Modal.jsx'
import { downloadCharacters, importCharacters } from '../utils/characterStore.js'

export default function Profile({ user, characters, onLogout, onImport }) {
  const [backup, setBackup] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function readBackup(event) {
    const file = event.target.files[0]
    event.target.value = ''
    if (!file) return
    setError('')
    setMessage('')
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error('La copia no puede superar los 10 MB.')
      setBackup(importCharacters(await file.text()))
    } catch (failure) { setError(failure.message) }
  }

  function restore() {
    try {
      onImport(backup)
      setBackup(null)
      setError('')
      setMessage('Copia restaurada. Tu biblioteca ya está actualizada.')
    } catch (failure) { setBackup(null); setError(failure.message) }
  }

  return <section className="profile-panel">
    <Icon name="user" size={36} />
    <h2>{user ? user.name : 'Exploras como invitado'}</h2>
    <p>{user ? user.email : 'Puedes crear y guardar personajes sin una cuenta. Cada cuenta local y el modo invitado tienen su propia biblioteca.'}</p>
    <div className="profile-stats"><p><strong>{characters.length}</strong> personajes</p><p><strong>{characters.filter(character => character.favorite).length}</strong> favoritos</p></div>
    <Link className="primary-button" to="/biblioteca">Abrir mi biblioteca</Link>
    {user ? <button className="secondary-button" onClick={async () => {
      try {
        await onLogout()
      } catch {
        setError('No se pudo cerrar la sesión. Inténtalo de nuevo.')
      }
    }}>Cerrar sesión</button> : <><Link className="secondary-button" to="/login">Iniciar sesión</Link><Link className="secondary-button" to="/registro">Crear cuenta local</Link></>}
    <h2>Copia de seguridad</h2>
    <p>Exporta tus personajes, favoritos y retratos para conservarlos o llevarlos a otro navegador. Las cuentas y contraseñas no se incluyen.</p>
    <button className="secondary-button" onClick={() => { try { downloadCharacters(characters); setMessage('Copia de seguridad preparada para descargar.'); setError('') } catch { setError('No se pudo preparar la descarga.') } }}>Exportar biblioteca (JSON)</button>
    <label className="form-field">Importar copia de seguridad<input type="file" accept=".json,application/json" onChange={readBackup} /></label>
    {message && <p className="feedback success" role="status">{message}</p>}
    {error && <p className="feedback error" role="alert">{error}</p>}
    <Link className="inline-link" to="/accesibilidad">Preferencias de accesibilidad</Link>
    <Link className="inline-link" to="/privacidad">Privacidad y uso</Link>
    {backup && <Modal title="¿Restaurar la biblioteca?" onClose={() => setBackup(null)}><div className="action-stack"><p className="page-description">La copia tiene {backup.length} personajes y sustituirá los {characters.length} actuales. Exporta tu biblioteca primero si quieres conservarla.</p><button className="primary-button" onClick={restore}>Sustituir y restaurar</button><button className="secondary-button" onClick={() => setBackup(null)}>Cancelar</button></div></Modal>}
  </section>
}
