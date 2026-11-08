import { NavLink } from 'react-router'
import Icon from '../icon/Icon.jsx'
import { mainTabs } from '../../data/navigation.js'

export default function BottomNavigation() {
  function handleKeys(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    const links = [...event.currentTarget.querySelectorAll('a')]
    const index = links.indexOf(document.activeElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + links.length) % links.length
    event.preventDefault()
    links[next].focus()
  }

  return (
    <nav className="bottom-navigation" aria-label="Navegación principal" onKeyDown={handleKeys}>
      {mainTabs.map(tab => <NavLink key={tab.path} to={tab.path}
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
        <Icon name={tab.icon} /><span className="nav-label">{tab.label}</span>
      </NavLink>)}
    </nav>
  )
}
