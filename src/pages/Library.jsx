import { Link, useLocation, useSearchParams } from 'react-router'
import CharacterCard from '../components/charactercard/CharacterCard.jsx'
import Icon from '../components/icon/Icon.jsx'
import { characterTypes } from '../data/characterOptions.js'

const simplify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')

export default function Library({ characters }) {
  const [params, setParams] = useSearchParams()
  const search = params.get('q') || ''
  const type = characterTypes.includes(params.get('class')) ? params.get('class') : ''
  const favorites = params.get('favorites') === '1'
  const sort = ['recent', 'name', 'level'].includes(params.get('sort')) ? params.get('sort') : 'recent'
  const { state } = useLocation()
  function updateFilter(key, value) {
    setParams(previous => {
      const next = new URLSearchParams(previous)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true })
  }
  const results = characters.filter(character =>
    simplify(`${character.name} ${character.type} ${character.race} ${character.realm}`).includes(simplify(search.trim())) &&
    (!type || character.type === type) && (!favorites || character.favorite))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name, 'es') : sort === 'level' ? b.level - a.level : b.updatedAt - a.updatedAt)

  return <section aria-labelledby="library-title">
    <div className="section-heading"><h2 id="library-title">Tus personajes</h2><Link className="text-button" to="/crear-personaje">＋ Crear personaje</Link></div>
    {state?.message && <p className="feedback success" role="status">{state.message}</p>}
    <label className="search-field"><Icon name="search" /><input aria-label="Buscar por nombre, clase, raza o reino" type="search" value={search} onChange={event => updateFilter('q', event.target.value)} placeholder="Buscar personaje…" /></label>
    <div className="form-row library-filters">
      <label>Clase<select value={type} onChange={event => updateFilter('class', event.target.value)}><option value="">Todas las clases</option>{characterTypes.map(item => <option key={item}>{item}</option>)}</select></label>
      <label>Ordenar<select value={sort} onChange={event => updateFilter('sort', event.target.value)}><option value="recent">Más recientes</option><option value="name">Nombre</option><option value="level">Mayor nivel</option></select></label>
    </div>
    <label className="preference-option"><input type="checkbox" checked={favorites} onChange={event => updateFilter('favorites', event.target.checked ? '1' : '')} />Solo favoritos</label>
    <p className="search-results" role="status">{results.length} {results.length === 1 ? 'personaje encontrado' : 'personajes encontrados'}.</p>
    <div className="character-grid">{results.map(character => <CharacterCard key={character.id} character={character} />)}</div>
    {results.length === 0 && <div className="empty-state"><p>{characters.length ? 'No hay personajes que coincidan con los filtros.' : 'Tu biblioteca está vacía. Empieza una nueva leyenda.'}</p>{characters.length ? <button className="secondary-button" onClick={() => setParams({}, { replace: true })}>Limpiar filtros</button> : <Link className="primary-button" to="/crear-personaje">Crear mi primer personaje</Link>}</div>}
    <p className="page-description">Tus cambios se guardan en este navegador. Puedes exportar una copia de seguridad desde Perfil.</p>
  </section>
}
