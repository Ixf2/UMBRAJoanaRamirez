import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import Header from './components/header/Header.jsx'
import BottomNavigation from './components/bottomnavigation/BottomNavigation.jsx'
import ConnectionStatus from './components/feedback/ConnectionStatus.jsx'
import Modal from './components/modal/Modal.jsx'
import Portrait from './components/charactercard/Portrait.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Library from './pages/Library.jsx'
import CreateCharacter from './pages/CreateCharacter.jsx'
import Auth from './pages/Auth.jsx'
import Profile from './pages/Profile.jsx'
import Accessibility from './pages/Accessibility.jsx'
import { Help, Inspiration, NotFound, Privacy } from './pages/Information.jsx'
import ReadAloud from './components/feedback/ReadAloud.jsx'
import { useCharacters } from './hooks/useCharacters.js'
import { usePreferences } from './hooks/usePreferences.js'
import { loginAccount, logoutAccount, readSession } from './utils/localAccounts.js'
import { attributeNames } from './data/characterOptions.js'
import { pageTitles } from './data/navigation.js'
import './App.css'

function Workspace({ user, onLogin, onLogout, accountError }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const main = useRef(null)
  const [modal, setModal] = useState(null)
  const [actionError, setActionError] = useState('')
  const { characters, storageError, saveCharacter, deleteCharacter, toggleFavorite, replaceCharacters } = useCharacters(user?.id || 'guest')
  const { preferences, updatePreferences, preferenceError } = usePreferences(user?.id || 'guest')
  const path = pathname.replace(/\/$/, '') || '/'
  const editing = /^\/personaje\/[^/]+\/editar$/.test(path)
  const page = pageTitles[path] || (editing ? 'Editar personaje' : 'Página no encontrada')
  const isLogin = path === '/login'
  const character = modal?.id ? characters.find(item => item.id === modal.id) : null

  useEffect(() => {
    document.title = `UMBRA · ${page}`
    main.current.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [pathname, page])

  function selectCharacter(item) { setActionError(''); setModal({ type: 'character', id: item.id }) }
  function act(callback) {
    try { callback(); setActionError('') }
    catch (error) { setActionError(error.message) }
  }
  function leaveModal() { setActionError(''); setModal(null) }

  const className = ['app-frame', isLogin && 'login-frame', preferences.enhancedFocus && 'enhanced-focus', preferences.reduceMotion && 'reduce-motion'].filter(Boolean).join(' ')

  return <div className={className} data-text-size={preferences.textSize} data-contrast={preferences.contrast} data-theme={preferences.theme} data-element-size={preferences.elementSize} data-accent={preferences.accent}>
    <a className="skip-link" href="#main-content">Saltar al contenido</a>
    <Header login={isLogin} user={user} onNotify={() => setModal({ type: 'notifications' })} />
    <ConnectionStatus />
    {preferences.announceNavigation && <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">Página: {page}</p>}
    {(storageError || accountError) && <p className="storage-notice" role="alert">{storageError || accountError}</p>}
    <main ref={main} className="main-content" id="main-content" tabIndex={-1}>
      {path !== '/inicio' && path !== '/' && !isLogin && <div className="page-heading"><p className="eyebrow">UMBRA · TUS HISTORIAS</p><h1>{page}</h1></div>}
      <Routes>
        <Route path="/" element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<Home characters={characters} user={user} onSelect={selectCharacter} />} />
        <Route path="/biblioteca" element={<Library characters={characters} onSelect={selectCharacter} />} />
        <Route path="/crear-personaje" element={<CreateCharacter key="create" characters={characters} onSave={saveCharacter} />} />
        <Route path="/personaje/:id/editar" element={<CreateCharacter key={path} characters={characters} onSave={saveCharacter} />} />
        <Route path="/inspiracion" element={<Inspiration />} />
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
    {modal && <Modal title={character ? (modal.type === 'delete' ? `¿Eliminar a ${character.name}?` : character.name) : 'Notificaciones'} onClose={leaveModal}>
      {modal.type === 'notifications' ? <div className="action-stack"><p className="page-description">No tienes avisos nuevos. Tu biblioteca tiene {characters.length} personajes y se guarda en este navegador.</p><p className="form-hint">Recuerda exportar una copia desde Perfil para conservar tus historias.</p><Link className="secondary-button" to="/perfil" onClick={leaveModal}>Ir a Perfil</Link></div>
        : character && (modal.type === 'delete' ? <div className="action-stack">
          <p className="page-description">La ficha se eliminará de esta biblioteca. Esta acción no se puede deshacer.</p>
          <button className="primary-button" onClick={() => act(() => { deleteCharacter(character.id); leaveModal() })}>Eliminar personaje</button>
          <button className="secondary-button" onClick={() => setModal({ type: 'character', id: character.id })}>Conservar personaje</button>
        </div> : <>
          <Portrait character={character} />
          <p className="eyebrow">{character.race} · {character.type} · Nivel {character.level}</p>
          {character.realm && <p className="page-description">{character.realm}</p>}
          <p className="character-story">{character.story || 'Esta historia está por escribir.'}</p>
          {preferences.readAloud && <ReadAloud key={character.id} text={`${character.name}. ${character.race}. ${character.type}. Nivel ${character.level}. ${character.realm}. ${character.story}. Rasgos: ${character.traits.join(', ')}. ${attributeNames.map((name, index) => `${name}: ${character.stats[index]}`).join('. ')}.`} rate={preferences.readingRate} />}
          <ul className="trait-list">{character.traits.map(trait => <li key={trait}>{trait}</li>)}</ul>
          <dl className="attribute-grid">{attributeNames.map((name, index) => <div key={name}><dt>{name}</dt><dd>{character.stats[index]}</dd></div>)}</dl>
          <div className="action-stack">
            <button className="secondary-button" aria-pressed={character.favorite} onClick={() => act(() => toggleFavorite(character.id))}>{character.favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}</button>
            <Link className="primary-button" to={`/personaje/${character.id}/editar`} onClick={leaveModal}>Editar personaje</Link>
            <button className="secondary-button" onClick={() => act(() => { const copy = saveCharacter({ ...character, id: undefined, name: `${character.name.slice(0, 52)} (copia)`, favorite: false }); leaveModal(); navigate('/biblioteca', { state: { message: `${copy.name}: personaje duplicado.` } }) })}>Duplicar personaje</button>
            <button className="text-button danger-button" onClick={() => setModal({ type: 'delete', id: character.id })}>Eliminar personaje</button>
          </div>
        </>)}
      {actionError && <p className="feedback error" role="alert">{actionError}</p>}
    </Modal>}
  </div>
}

export default function App() {
  const [initial] = useState(() => {
    try { return { user: readSession(), error: '' } }
    catch { return { user: null, error: 'No se pudo leer la sesión local. Comprueba los permisos de almacenamiento del navegador.' } }
  })
  const [user, setUser] = useState(initial.user)
  async function login(data) { setUser(await loginAccount(data)) }
  function logout() { logoutAccount(); setUser(null) }
  return <Workspace key={user?.id || 'guest'} user={user} onLogin={login} onLogout={logout} accountError={initial.error} />
}
