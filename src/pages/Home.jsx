import { Link } from 'react-router'
import Hero from '../components/hero/Hero.jsx'
import CharacterCard from '../components/charactercard/CharacterCard.jsx'

export default function Home({ onSelect, characters, user }) {
  const recent = [...characters].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 2)
  return <>
    <Hero />
    <div className="ornament" aria-hidden="true"><span>❖</span></div>
    <section aria-labelledby="characters-title">
      <div className="section-heading">
        <h2 id="characters-title">Personajes recientes</h2>
        <Link className="text-button" to="/biblioteca">Ver todos <span aria-hidden="true">→</span></Link>
      </div>
      <div className="character-grid">{recent.map(character => <CharacterCard key={character.id} character={character} onSelect={onSelect} />)}</div>
      {!recent.length && <p className="page-description">Tu biblioteca está vacía. Crea un personaje para comenzar tu historia.</p>}
    </section>
    <p className="closing-quote">«Incluso en la oscuridad, una historia perdura.»</p>
    <p className="guest-note">{user ? <>Bienvenido, {user.name}. <Link to="/perfil">Ver perfil</Link></> : <>Estás explorando como invitado. <Link to="/login">Iniciar sesión</Link></>}</p>
  </>
}
