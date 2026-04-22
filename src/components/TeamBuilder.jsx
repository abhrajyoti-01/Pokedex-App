import { useState, useMemo, useCallback } from 'react'
import { typeColors, getSpriteUrl, allTypes } from '../utils/typeColors'

const MAX_TEAM = 6

const againstMap = {
  normal: 'normal', fire: 'fire', water: 'water', electric: 'electric',
  grass: 'grass', ice: 'ice', fighting: 'fighting', poison: 'poison',
  ground: 'ground', flying: 'flying', psychic: 'psychic', bug: 'bug',
  rock: 'rock', ghost: 'ghost', dragon: 'dragon', dark: 'dark',
  steel: 'steel', fairy: 'fairy',
}

export default function TeamBuilder({ pokemon, pokemonMap, onClose }) {
  const [team, setTeam] = useState([])
  const [search, setSearch] = useState('')

  const suggestions = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase().trim()
    const teamIds = new Set(team.map(p => p.pokedexNumber))
    return pokemon
      .filter(p => !teamIds.has(p.pokedexNumber) && p.name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [search, pokemon, team])

  const addPokemon = useCallback((p) => {
    setTeam(prev => prev.length < MAX_TEAM ? [...prev, p] : prev)
    setSearch('')
  }, [])

  const removePokemon = useCallback((id) => {
    setTeam(prev => prev.filter(p => p.pokedexNumber !== id))
  }, [])

  const coverage = useMemo(() => {
    if (team.length === 0) return { weak: [], resist: [], immune: [] }
    const scores = {}
    allTypes.forEach(t => { scores[t] = { weak: 0, resist: 0, immune: 0, total: 0 } })

    team.forEach(p => {
      allTypes.forEach(attackType => {
        const mult = p.against[attackType]
        const s = scores[attackType]
        s.total += mult
        if (mult > 1) s.weak++
        else if (mult > 0 && mult < 1) s.resist++
        else if (mult === 0) s.immune++
      })
    })

    const weak = allTypes
      .filter(t => scores[t].weak === team.length)
      .map(t => ({ type: t, score: scores[t].total }))

    const strong = allTypes
      .filter(t => scores[t].resist === team.length || scores[t].immune > 0)
      .sort((a, b) => scores[b.a]?.total - scores[a.a]?.total)

    return { weak, strong, scores }
  }, [team])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold">Team Builder</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close team builder"
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Team slots */}
          <div>
            <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">
              Your Team ({team.length}/{MAX_TEAM})
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Array.from({ length: MAX_TEAM }, (_, i) => {
                const member = team[i]
                if (member) {
                  const glow = typeColors[member.type1]?.bg || '#666'
                  return (
                    <div key={member.pokedexNumber} className="relative flex flex-col items-center p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <button
                        type="button"
                        onClick={() => removePokemon(member.pokedexNumber)}
                        aria-label={`Remove ${member.name}`}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/30 text-red-400 flex items-center justify-center text-xs cursor-pointer hover:bg-red-500/50 transition-colors"
                      >
                        &times;
                      </button>
                      <img
                        src={getSpriteUrl(member.pokedexNumber)}
                        alt={member.name}
                        loading="lazy"
                        decoding="async"
                        width={48}
                        height={48}
                        className="w-12 h-12 object-contain"
                        style={{ filter: `drop-shadow(0 2px 6px ${glow}66)` }}
                        onError={(e) => {
                          if (e.target.dataset.fallback) return
                          e.target.dataset.fallback = '1'
                          e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${member.pokedexNumber}.png`
                        }}
                      />
                      <span className="text-[9px] capitalize text-white/50 mt-1 truncate w-full text-center">{member.name}</span>
                    </div>
                  )
                }
                return (
                  <div key={`empty-${i}`} className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-white/10 min-h-[80px]">
                    <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center text-white/10 text-lg">+</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Search to add */}
          {team.length < MAX_TEAM && (
            <div>
              <label htmlFor="team-search" className="sr-only">Search Pokémon to add</label>
              <input
                id="team-search"
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search to add Pokémon..."
                autoComplete="off"
                className="w-full px-4 py-2 bg-white/5 border border-white/5 rounded-full text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              />
              {suggestions.length > 0 && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {suggestions.map(p => (
                    <button
                      key={p.pokedexNumber}
                      type="button"
                      onClick={() => addPokemon(p)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                    >
                      <img
                        src={getSpriteUrl(p.pokedexNumber)}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        width={32}
                        height={32}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          if (e.target.dataset.fallback) return
                          e.target.dataset.fallback = '1'
                          e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokedexNumber}.png`
                        }}
                      />
                      <span className="text-xs capitalize text-white/50">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Coverage Matrix */}
          {team.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Defensive Coverage</h3>

              {coverage.weak.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-red-400/70 uppercase tracking-widest mb-2">Team Weaknesses (all members weak)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coverage.weak.map(({ type }) => (
                      <span key={type} className="text-xs px-2.5 py-1 rounded-full capitalize" style={{ backgroundColor: typeColors[type]?.bg || '#888', color: typeColors[type]?.text || '#fff' }}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {coverage.weak.length === 0 && (
                <p className="text-xs text-green-400/50 mb-4">No shared weaknesses! Your team has good coverage.</p>
              )}

              <div>
                <p className="text-[10px] text-white/20 uppercase tracking-widest mb-2">Type Resistance Overview</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {allTypes.map(type => {
                    const s = coverage.scores[type]
                    const avg = s.total / team.length
                    let bg = 'bg-white/[0.03]'
                    let textColor = 'text-white/25'
                    if (avg > 1.2) { bg = 'bg-red-500/15'; textColor = 'text-red-400/60' }
                    else if (avg < 0.8) { bg = 'bg-green-500/10'; textColor = 'text-green-400/50' }
                    return (
                      <div key={type} className={`${bg} rounded-lg px-2 py-1.5 text-center`}>
                        <div className="text-[9px] capitalize text-white/20 mb-0.5">{type}</div>
                        <div className={`text-[10px] font-mono ${textColor}`}>{avg.toFixed(2)}x</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
