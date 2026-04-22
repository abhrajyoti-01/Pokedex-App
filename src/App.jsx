import { useState, useMemo, useCallback } from 'react'
import { usePokemon } from './data/usePokemon'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import SortControls from './components/SortControls'
import GenerationBar from './components/GenerationBar'
import StatSlider from './components/StatSlider'
import PokemonGrid from './components/PokemonGrid'
import PokemonModal from './components/PokemonModal'
import CompareModal from './components/CompareModal'
import TeamBuilder from './components/TeamBuilder'

const defaultStatRanges = {
  hp: { min: 0, max: 255 },
  attack: { min: 0, max: 255 },
  defense: { min: 0, max: 255 },
  spAttack: { min: 0, max: 255 },
  spDefense: { min: 0, max: 255 },
  speed: { min: 0, max: 255 },
}

function sortPokemon(list, sortKey) {
  const sorted = [...list]
  const [field, dir] = sortKey.split('_')
  const multiplier = dir === 'desc' ? -1 : 1
  sorted.sort((a, b) => {
    let valA, valB
    if (field === 'number') { valA = a.pokedexNumber; valB = b.pokedexNumber }
    else if (field === 'name') return multiplier * a.name.localeCompare(b.name)
    else { valA = a[field] || 0; valB = b[field] || 0 }
    return multiplier * (valA - valB)
  })
  return sorted
}

export default function App() {
  const { pokemon, pokemonMap, loading, error } = usePokemon()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ type: '', generation: '', legendary: false })
  const [sort, setSort] = useState('number_asc')
  const [statRanges, setStatRanges] = useState(defaultStatRanges)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [comparePokemon1, setComparePokemon1] = useState(null)
  const [comparePokemon2, setComparePokemon2] = useState(null)
  const [showTeamBuilder, setShowTeamBuilder] = useState(false)

  const filtered = useMemo(() => {
    let result = pokemon
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(p => p.name.toLowerCase().includes(q) || String(p.pokedexNumber).includes(q))
    }
    if (filters.type) result = result.filter(p => p.type1 === filters.type || p.type2 === filters.type)
    if (filters.generation) { const gen = parseInt(filters.generation); result = result.filter(p => p.generation === gen) }
    if (filters.legendary) result = result.filter(p => p.isLegendary)
    result = result.filter(p => Object.entries(statRanges).every(([stat, range]) => { const val = p[stat] || 0; return val >= range.min && val <= range.max }))
    return sortPokemon(result, sort)
  }, [pokemon, search, filters, sort, statRanges])

  const handleSelect = useCallback((p) => {
    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        setSelectedPokemon(p)
      })
      return
    }
    setSelectedPokemon(p)
  }, [])

  const handleClose = useCallback(() => setSelectedPokemon(null), [])

  const handleCompare = useCallback((p) => {
    setComparePokemon1(p)
    setComparePokemon2(null)
  }, [])

  const handleCloseCompare = useCallback(() => {
    setComparePokemon1(null)
    setComparePokemon2(null)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" role="status">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white/30 rounded-full animate-spin" aria-hidden="true" />
        <p className="text-white/30 text-sm">Loading Pokémon data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-red-400/70" role="alert">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-black/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <radialGradient id="poke-highlight" cx="35%" cy="30%" r="60%"><stop offset="0%" stopColor="white" stopOpacity="0.45"/><stop offset="50%" stopColor="white" stopOpacity="0.08"/><stop offset="100%" stopColor="black" stopOpacity="0.25"/></radialGradient>
                  <linearGradient id="red-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF2B2B"/><stop offset="70%" stopColor="#CC0000"/><stop offset="100%" stopColor="#990000"/></linearGradient>
                  <linearGradient id="white-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFFFF"/><stop offset="70%" stopColor="#E8E8E8"/><stop offset="100%" stopColor="#CCCCCC"/></linearGradient>
                  <linearGradient id="band-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3a3a3a"/><stop offset="40%" stopColor="#1a1a1a"/><stop offset="60%" stopColor="#1a1a1a"/><stop offset="100%" stopColor="#3a3a3a"/></linearGradient>
                  <clipPath id="ball-clip"><circle cx="50" cy="50" r="44"/></clipPath>
                </defs>
                <g clipPath="url(#ball-clip)">
                  <rect x="0" y="0" width="100" height="50" fill="url(#red-body)"/>
                  <rect x="0" y="50" width="100" height="50" fill="url(#white-body)"/>
                  <rect x="0" y="42" width="100" height="16" fill="url(#band-grad)"/>
                  <circle cx="50" cy="50" r="16" fill="#1a1a1a"/>
                  <circle cx="50" cy="50" r="12" fill="#E8E8E8"/>
                  <circle cx="50" cy="50" r="9" fill="#2a2a2a"/>
                  <circle cx="50" cy="50" r="6" fill="#FAFAFA"/>
                  <circle cx="46" cy="46" r="2" fill="white" opacity="0.7"/>
                  <rect x="0" y="0" width="100" height="100" fill="url(#poke-highlight)"/>
                </g>
                <circle cx="50" cy="50" r="44" fill="none" stroke="#2a2a2a" strokeWidth="4"/>
              </svg>
              <h1 className="text-xl font-bold tracking-tight">Pokédex</h1>
            </div>
            <span className="text-[10px] text-white/20 hidden sm:inline">{pokemon.length} Pokémon</span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setShowTeamBuilder(true)}
              aria-label="Open team builder"
              className="px-3 py-1.5 rounded-full text-xs border border-white/5 bg-white/[0.03] text-white/40 hover:bg-white/[0.06] hover:text-white/60 transition-colors duration-150 cursor-pointer"
            >
              Team Builder
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1"><SearchBar value={search} onChange={setSearch} /></div>
            <div className="flex gap-2 items-center">
              <SortControls sort={sort} onSortChange={setSort} />
              <button
                type="button"
                onClick={() => setShowFilters(f => !f)}
                aria-label="Toggle filters"
                aria-expanded={showFilters}
                aria-controls="filter-panel"
                className={`px-3 py-2 rounded-full text-sm border transition-colors duration-150 cursor-pointer ${showFilters ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>

          {showFilters && (
            <div id="filter-panel" className="mt-3 pt-3 border-t border-white/5 space-y-3">
              <FilterPanel filters={filters} onFilterChange={setFilters} />
              <StatSlider statRanges={statRanges} onStatRangeChange={setStatRanges} />
            </div>
          )}

          <nav className="mt-3" aria-label="Generation filter">
            <GenerationBar generation={filters.generation} onGenerationChange={(v) => setFilters(f => ({ ...f, generation: v }))} />
          </nav>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 py-6">
        <PokemonGrid pokemon={filtered} onSelect={handleSelect} />
      </main>

      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          pokemonMap={pokemonMap}
          onClose={handleClose}
          onSelectPokemon={handleSelect}
          onCompare={handleCompare}
        />
      )}

      {comparePokemon1 && (
        <CompareModal
          pokemon1={comparePokemon1}
          pokemon2={comparePokemon2}
          pokemon={pokemon}
          onClose={handleCloseCompare}
        />
      )}

      {showTeamBuilder && (
        <TeamBuilder
          pokemon={pokemon}
          pokemonMap={pokemonMap}
          onClose={() => setShowTeamBuilder(false)}
        />
      )}
    </div>
  )
}
