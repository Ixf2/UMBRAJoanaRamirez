import { Link, useLocation } from 'react-router'
import Portrait from './Portrait.jsx'

export default function CharacterCard({ character, interactive = true }) {
  const { pathname, search } = useLocation()

  const contenido = (
    <>
      <Portrait character={character} />
      <div className="character-info">
        <h3>{character.name}</h3>
        <p>
          {character.type}
          {character.level != null && ` · Nivel ${character.level}`}
        </p>
        {character.favorite && (
          <span className="favorite-label">★ Favorito</span>
        )}
      </div>
    </>
  )

  if (!interactive) {
    return (
      <article className="character-card">
        {contenido}
      </article>
    )
  }

  return (
    <Link
      className="character-card"
      to={`/biblioteca/${encodeURIComponent(character.id)}`}
      state={{ returnTo: `${pathname}${search}` }}
      aria-label={`Ver ficha de ${character.name}, ${character.type}, nivel ${character.level}`}
    >
      {contenido}
    </Link>
  )
}