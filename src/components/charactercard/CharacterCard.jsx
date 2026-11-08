import Portrait from './Portrait.jsx'

export default function CharacterCard({ character, onSelect }) {
  return <button className="character-card" onClick={() => onSelect(character)} aria-label={`Ver ficha de ${character.name}, ${character.type}, nivel ${character.level}`}>
    <Portrait character={character} />
    <div className="character-info"><h3>{character.name}</h3><p>{character.type} · Nivel {character.level}</p>{character.favorite && <span className="favorite-label">★ Favorito</span>}</div>
  </button>
}
