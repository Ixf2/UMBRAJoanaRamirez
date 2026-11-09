import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useMatch } from 'react-router'
import Header from './components/header/Header.jsx'
import BottomNavigation from './components/bottomnavigation/BottomNavigation.jsx'
import ConnectionStatus from './components/feedback/ConnectionStatus.jsx'
import Modal from './components/modal/Modal.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Library from './pages/Library.jsx'
import CharacterDetail from './pages/CharacterDetail.jsx'
import CreateCharacter from './pages/CreateCharacter.jsx'
import Auth from './pages/Auth.jsx'
import Profile from './pages/Profile.jsx'
import Accessibility from './pages/Accessibility.jsx'
import Inspiration from './pages/Inspiration.jsx'
import { Help, NotFound, Privacy } from './pages/Information.jsx'
import { useCharacters } from './hooks/useCharacters.js'
import { usePreferences } from './hooks/usePreferences.js'
import { iniciarSesion, obtenerSesion, cerrarSesion } from './services/api.js'
import { pageTitles } from './data/navigation.js'
import PublicCharacterDetail from './pages/PublicCharacterDetail.jsx'
import './App.css'

function Workspace({ user, onLogin, onLogout, accountError }) {
  const { pathname } = useLocation()
  const main = useRef(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { characters, storageError, saveCharacter, deleteCharacter, toggleFavorite, replaceCharacters } = useCharacters(user?.id || 'guest')
  const { preferences, updatePreferences, preferenceError } = usePreferences(user?.id || 'guest')
  const path = pathname.replace(/\/$/, '') || '/'
  const detailMatch = useMatch('/biblioteca/:id')
  const character = detailMatch ? characters.find(item => item.id === detailMatch.params.id) : null
  const editing = /^\/personaje\/[^/]+\/editar$/.test(path)
  const page = pageTitles[path] || (detailMatch ? character?.name || 'Personaje no encontrado' : editing ? 'Editar personaje' : 'Página no encontrada')
  const isLogin = path === '/login'

  useEffect(() => {
    document.title = `UMBRA · ${page}`
    main.current.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [pathname, page])

  const className = ['app-frame', isLogin && 'login-frame', preferences.enhancedFocus && 'enhanced-focus', preferences.reduceMotion && 'reduce-motion'].filter(Boolean).join(' ')

  return <div className={className} data-text-size={preferences.textSize} data-contrast={preferences.contrast} data-theme={preferences.theme} data-element-size={preferences.elementSize} data-accent={preferences.accent}>
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <Header login={isLogin} user={user} onNotify={() => setNotificationsOpen(true)} />
    <ConnectionStatus />
    {preferences.announceNavigation && <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">Página: {page}</p>}
    {(storageError || accountError) && <p className="storage-notice" role="alert">{storageError || accountError}</p>}
    <main ref={main} className="main-content" id="main-content" tabIndex={-1}>
      {path !== '/inicio' && path !== '/' && !isLogin && <div className="page-heading"><p className="eyebrow">UMBRA · TUS HISTORIAS</p><h1>{page}</h1></div>}
      <Routes>
        <Route path="/personajes-publicos/:id" element={<PublicCharacterDetail />}/>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<Home characters={characters} user={user} />} />
        <Route path="/biblioteca" element={<Library characters={characters} />} />
        <Route path="/biblioteca/:id" element={<CharacterDetail key={path} characters={characters} onSave={saveCharacter} onDelete={deleteCharacter} onToggleFavorite={toggleFavorite} preferences={preferences} />} />
        <Route path="/crear-personaje" element={<CreateCharacter key="create" characters={characters} onSave={saveCharacter} />} />
        <Route path="/personaje/:id/editar" element={<CreateCharacter key={path} characters={characters} onSave={saveCharacter} />} />
        <Route path="/inspiracion" element={<Inspiration preferences={preferences} onSave={saveCharacter} />} />
        <Route path="/perfil" element={<Profile user={user} characters={characters} onLogout={onLogout} onImport={replaceCharacters} />} />
        <Route path="/login" element={user ? <Navigate to="/perfil" replace /> : <Login onLogin={onLogin} />} />
        <Route path="/registro" element={user ? <Navigate to="/perfil" replace /> : <Auth key="register" />} />
        <Route path="/recuperar" element={user ? <Navigate to="/perfil" replace /> : <Auth key="recover" recovery />} />
        <Route path="/ayuda" element={<Help />} />
        <Route path="/accesibilidad/:section?" element={<Accessibility preferences={preferences} onChange={updatePreferences} error={preferenceError} user={user} />} />
        <Route path="/privacidad" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    {!isLogin && <BottomNavigation />}
    {notificationsOpen && <Modal title="Notificaciones" onClose={() => setNotificationsOpen(false)}>
      <div className="action-stack"><p className="page-description">No tienes avisos nuevos. Tu biblioteca tiene {characters.length} personajes y se guarda en este navegador.</p><p className="form-hint">Recuerda exportar una copia desde Perfil para conservar tus historias.</p><Link className="secondary-button" to="/perfil" onClick={() => setNotificationsOpen(false)}>Ir a Perfil</Link></div>
    </Modal>}
  </div>
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accountError, setAccountError] = useState('')

  useEffect(() => {
    let activo = true

    obtenerSesion()
      .then(datos => {
        if (activo && datos) {
          setUser({
            id: String(datos.idUsuario),
            name: datos.nombreUsuario,
            email: datos.email,
            rol: datos.rol,
          })
        }
      })
      .catch(() => {
        if (activo) {
          setAccountError('No se pudo comprobar la sesión con el servidor.')
        }
      })
      .finally(() => {
        if (activo) setLoading(false)
      })

    return () => {
      activo = false
    }
  }, [])

  async function login(datos) {
    const respuesta = await iniciarSesion(datos)

    setUser({
      id: String(respuesta.idUsuario),
      name: respuesta.nombreUsuario,
      email: respuesta.email,
      rol: respuesta.rol,
    })
  }

  async function logout() {
    await cerrarSesion()
    setUser(null)
  }

  if (loading) {
    return <p role="status">Comprobando sesión...</p>
  }

  return (
    <Workspace
      key={user?.id || 'guest'}
      user={user}
      onLogin={login}
      onLogout={logout}
      accountError={accountError}
    />
  )
}
