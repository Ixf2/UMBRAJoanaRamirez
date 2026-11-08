import { Link, useLocation } from 'react-router'
import Portrait from './Portrait.jsx'

export default function CharacterCard({ character }) {
  const { pathname, search } = useLocation()
  return <Link className="character-card" to={`/biblioteca/${encodeURIComponent(character.id)}`} state={{ returnTo: `${pathname}${search}` }} aria-label={`Ver ficha de ${character.name}, ${character.type}, nivel ${character.level}`}>
    <Portrait character={character} />
    <div className="character-info"><h3>{character.name}</h3><p>{character.type} · Nivel {character.level}</p>{character.favorite && <span className="favorite-label">★ Favorito</span>}</div>
  </Link>
}
