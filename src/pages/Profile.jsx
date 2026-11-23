
import { useState } from 'react'
import { Link } from 'react-router'
import Icon from '../components/icon/Icon.jsx'
import Modal from '../components/modal/Modal.jsx'
import {
  downloadCharacters,
  importCharacters
} from '../utils/characterStore.js'

export default function Profile({
  user,
  characters,
  onLogout,
  onImport
}) {
  const [backup, setBackup] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [details, setDetails] = useState([])
  const [importing, setImporting] = useState(false)

  async function readBackup(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setError('')
    setMessage('')
    setDetails([])

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('El archivo no puede superar los 10 MB.')
      }

      const contenido = await file.text()
      const personajes = importCharacters(contenido)

      setBackup(personajes)
    } catch (failure) {
      setError(failure.message)
    }
  }

  async function restore() {
    if (!backup || importing) return

    setImporting(true)
    setError('')
    setMessage('')
    setDetails([])

    try {
      const resultado = await onImport(backup)

      setMessage(
        `Importación finalizada: ${resultado.importados} personajes ` +
        `importados, ${resultado.omitidos} omitidos y ` +
        `${resultado.imagenes} imágenes subidas.`
      )

      setDetails(resultado.errores)
      setBackup(null)
    } catch (failure) {
      setError(
        failure.message || 'No se pudo importar la biblioteca.'
      )
    } finally {
      setImporting(false)
    }
  }

  function exportBackup() {
    try {
      downloadCharacters(characters)
      setMessage('Copia JSON preparada.')
      setError('')
    } catch {
      setError('No se pudo exportar la biblioteca.')
    }
  }

  async function logout() {
    try {
      await onLogout()
    } catch {
      setError('No se pudo cerrar la sesión.')
    }
  }

  return (
    <section className="profile-panel">
      <Icon name="user" size={36} />

      <h2>{user ? user.name : 'Invitado'}</h2>

      <p>
        {user
          ? user.email
          : 'Inicia sesión para gestionar tus personajes.'}
      </p>

      <div className="profile-stats">
        <p>
          <strong>{characters.length}</strong> personajes
        </p>

        <p>
          <strong>
            {characters.filter(item => item.favorite).length}
          </strong>{' '}
          favoritos
        </p>
      </div>

      <Link className="primary-button" to="/biblioteca">
        Abrir mi biblioteca
      </Link>

      {user && (
        <button
          type="button"
          className="secondary-button"
          onClick={logout}
          disabled={importing}
        >
          Cerrar sesión
        </button>
      )}

      <h2>Copia de seguridad</h2>

      <p>
        Importa tus personajes antiguos desde una copia JSON
        de UMBRA a MariaDB.
      </p>

      <button
        type="button"
        className="secondary-button"
        onClick={exportBackup}
        disabled={importing}
      >
        Exportar biblioteca (JSON)
      </button>

      <p className="form-hint">
        La exportación actual conserva los datos de las fichas,
        pero no incluye automáticamente las imágenes almacenadas
        en MariaDB.
      </p>

      <label className="form-field">
        Importar copia de seguridad

        <input
          type="file"
          accept=".json,application/json"
          onChange={readBackup}
          disabled={importing || !user}
        />
      </label>

      {importing && (
        <p role="status">
          Importando personajes a MariaDB...
        </p>
      )}

      {message && (
        <p className="feedback success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}

      {details.length > 0 && (
        <div className="feedback error" role="alert">
          <p>Hay elementos que necesitan revisión:</p>

          <ul>
            {details.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <Link className="inline-link" to="/accesibilidad">
        Preferencias de accesibilidad
      </Link>

      <Link className="inline-link" to="/privacidad">
        Privacidad y uso
      </Link>

      {backup && (
        <Modal
          title="Importar personajes a MariaDB"
          onClose={() => {
            if (!importing) setBackup(null)
          }}
        >
          <div className="action-stack">
            <p className="page-description">
              Se han encontrado {backup.length} personajes.
              Se añadirán a MariaDB sin eliminar tus fichas
              actuales.
            </p>

            <button
              type="button"
              className="primary-button"
              disabled={importing}
              onClick={restore}
            >
              {importing
                ? 'Importando...'
                : 'Confirmar importación'}
            </button>

            <button
              type="button"
              className="secondary-button"
              disabled={importing}
              onClick={() => setBackup(null)}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </section>
  )
}
