import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'
import Icon from '../icon/Icon.jsx'
import { menuItems } from '../../data/navigation.js'

export default function Header({ onNotify, login = false, user }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const header = useRef(null)
  const menuButton = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function closeOutside(event) {
      if (!header.current.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
    menuButton.current.focus()
  }

  return (
    <header ref={header} className="header" onKeyDown={event => {
      if (event.key === 'Escape' && menuOpen) closeMenu()
    }}>
      {login ? <Link className="icon-button" to="/inicio" aria-label="Volver al inicio"><Icon name="back" /></Link> : <button ref={menuButton} className="icon-button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={menuOpen} aria-controls="header-menu" onClick={() => setMenuOpen(!menuOpen)}>
        <Icon name="menu" />
      </button>}
      <Link className="brand" to="/inicio" aria-label="Umbra, inicio" onClick={() => setMenuOpen(false)}>
        <Icon name="crest" size={27} /><span>UMBRA</span>
      </Link>
      {login ? <Link className="icon-button" to="/ayuda" aria-label="Ayuda y soporte"><Icon name="help" /></Link> : <button className="icon-button notification-trigger" aria-label="Notificaciones" onClick={onNotify}>
        <Icon name="bell" />
      </button>}
      {!login && menuOpen && <nav id="header-menu" className="header-popover" aria-label="Menú de secciones">
        {menuItems.filter(item => !user || item.path !== '/login').map(item => <NavLink key={item.path} to={item.path} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
        <button onClick={closeMenu}>Cerrar menú</button>
      </nav>}
    </header>
  )
}
