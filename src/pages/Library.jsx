
import { Link, useLocation, useSearchParams } from 'react-router'
import CharacterCard from '../components/charactercard/CharacterCard.jsx'
import Icon from '../components/icon/Icon.jsx'
import { characterTypes } from '../data/characterOptions.js'
import PublicCharacters from '../components/publiccharacters/PublicCharacters.jsx'

const simplify = value =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')

export default function Library({ characters = [] }) {
  const [params, setParams] = useSearchParams()
  const { state } = useLocation()

  const search = params.get('q') || ''
  const type = characterTypes.includes(params.get('class'))
    ? params.get('class')
    : ''
  const favorites = params.get('favorites') === '1'
  const sort = ['recent', 'name', 'level'].includes(params.get('sort'))
    ? params.get('sort')
    : 'recent'

  function updateFilter(key, value) {
    setParams(previous => {
      const next = new URLSearchParams(previous)

      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }

      return next
    }, { replace: true })
  }

  function clearFilters() {
    setParams({}, { replace: true })
  }

  const activeFilters = [
    ...(search.trim()
      ? [{ key: 'q', label: `Búsqueda: ${search.trim()}` }]
      : []),
    ...(type
      ? [{ key: 'class', label: `Clase: ${type}` }]
      : []),
    ...(favorites
      ? [{ key: 'favorites', label: 'Solo favoritos' }]
      : []),
    ...(sort !== 'recent'
      ? [{
        key: 'sort',
        label: sort === 'name'
          ? 'Orden: nombre'
          : 'Orden: mayor nivel'
      }]
      : [])
  ]

  const results = characters
    .filter(character => {
      const searchableText = [
        character.name,
        character.type,
        character.race,
        character.realm
      ].join(' ')

      return (
        simplify(searchableText).includes(simplify(search.trim())) &&
        (!type || character.type === type) &&
        (!favorites || character.favorite)
      )
    })
    .sort((a, b) => {
      if (sort === 'name') {
        return a.name.localeCompare(b.name, 'es')
      }

      if (sort === 'level') {
        return Number(b.level || 0) - Number(a.level || 0)
      }

      return Number(b.updatedAt || 0) - Number(a.updatedAt || 0)
    })

  const hasFilters = activeFilters.length > 0

  return (
    <section aria-labelledby="library-title">
      <div className="section-heading">
        <h2 id="library-title">Tus personajes</h2>

        <Link className="text-button" to="/crear-personaje">
          ＋ Crear personaje
        </Link>
      </div>

      {state?.message && (
        <p className="feedback success" role="status">
          {state.message}
        </p>
      )}

      <label className="search-field">
        <Icon name="search" />

        <input
          aria-label="Buscar por nombre, clase, raza o reino"
          type="search"
          value={search}
          maxLength={100}
          onChange={event => updateFilter('q', event.target.value)}
          placeholder="Buscar personaje…"
        />
      </label>

      <div className="form-row library-filters">
        <label>
          Clase

          <select
            value={type}
            onChange={event => updateFilter('class', event.target.value)}
          >
            <option value="">Todas las clases</option>

            {characterTypes.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          Ordenar

          <select
            value={sort}
            onChange={event => updateFilter('sort', event.target.value)}
          >
            <option value="recent">Más recientes</option>
            <option value="name">Nombre</option>
            <option value="level">Mayor nivel</option>
          </select>
        </label>
      </div>

      <label className="preference-option">
        <input
          type="checkbox"
          checked={favorites}
          onChange={event =>
            updateFilter('favorites', event.target.checked ? '1' : '')
          }
        />

        Solo favoritos
      </label>

      {hasFilters && (
        <div
          className="active-filters"
          aria-label="Filtros activos"
        >
          <p className="active-filters-title">
            Filtros activos
          </p>

          <div className="filter-chip-list">
            {activeFilters.map(filter => (
              <button
                key={filter.key}
                type="button"
                className="filter-chip"
                onClick={() => updateFilter(filter.key, '')}
                aria-label={`Quitar filtro ${filter.label}`}
                title={`Quitar ${filter.label}`}
              >
                <span>{filter.label}</span>
                <span aria-hidden="true">×</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="clear-filters-button"
            onClick={clearFilters}
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}

      <p className="search-results" role="status" aria-live="polite">
        {results.length}{' '}
        {results.length > 0
          ? `${results.length} ${results.length === 1 ? 'personaje personal encontrado' : 'personajes personales encontrados'}.`
          : ''}
      </p>

      <div className="character-grid">
        {results.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
          />
        ))}
      </div>

      {results.length === 0 && (
        <div className="empty-state">
          <p>
            {characters.length
              ? 'No hay personajes personales que coincidan con los filtros.'
              : 'Tu biblioteca personal está vacía. Empieza una nueva leyenda.'}
          </p>



          {characters.length === 0 && (
            <Link
              className="primary-button"
              to="/crear-personaje"
            >
              Crear mi primer personaje
            </Link>
          )}
        </div>
      )}

      

      <PublicCharacters
        search={search}
        type={type}
        sort={sort}
      />
    </section>
  )
}
