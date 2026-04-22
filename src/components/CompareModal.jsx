import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { typeColors, getSpriteUrl, getStatColor } from '../utils/typeColors'
import RadarChart from './RadarChart'

export default function CompareModal({ pokemon1, pokemon2, pokemon, onClose }) {
  const [open, setOpen] = useState(false)
  const [search2, setSearch2] = useState('')
  const [selected2, setSelected2] = useState(pokemon2)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    setSelected2(pokemon2)
    requestAnimationFrame(() => setOpen(true))
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
      if (previousFocusRef.current) previousFocusRef.current.focus()
    }
  }, [pokemon2, onClose])

  const handleClose = useCallback(() => {
    setOpen(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const suggestions = useMemo(() => {
    if (!search2.trim()) return []
    const q = search2.toLowerCase().trim()
    return pokemon
      .filter(p => p.pokedexNumber !== pokemon1.pokedexNumber && p.name.toLowerCase().includes(q))
      .slice(0, 6)
  }, [search2, pokemon, pokemon1])

  const stats = useMemo(() => {
    const keys = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']
    const labels = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']
    return keys.map((key, i) => ({
      label: labels[i],
      key,
      val1: pokemon1[key] || 0,
      val2: selected2 ? (selected2[key] || 0) : 0,
    }))
  }, [pokemon1, selected2])

  if (!pokemon1) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
      style={{ opacity: open ? 1 : 0 }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Compare ${pokemon1.name}`}
    >
      <div
        className="fixed inset-4 sm:inset-x-auto sm:inset-y-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-3xl w-auto
          bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden flex flex-col
          transition-all duration-300"
        style={{ opacity: open ? 1 : 0, transform: open ? 'translateX(0) scale(1)' : 'scale(0.95)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold">Compare</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close compare"
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Two Pokemon headers */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col items-center">
              <img
                src={getSpriteUrl(pokemon1.pokedexNumber)}
                alt={pokemon1.name}
                loading="lazy"
                decoding="async"
                width={80}
                height={80}
                className="w-20 h-20 object-contain"
                style={{ filter: `drop-shadow(0 2px 8px ${typeColors[pokemon1.type1]?.bg || '#666'}66)` }}
                onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback='1'; e.target.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon1.pokedexNumber}.png` } }}
              />
              <span className="text-sm font-semibold capitalize mt-1">{pokemon1.name}</span>
              <div className="flex gap-1 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: typeColors[pokemon1.type1]?.bg, color: typeColors[pokemon1.type1]?.text }}>{pokemon1.type1}</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              {selected2 ? (
                <>
                  <div className="relative group">
                    <img
                      src={getSpriteUrl(selected2.pokedexNumber)}
                      alt={selected2.name}
                      loading="lazy"
                      decoding="async"
                      width={80}
                      height={80}
                      className="w-20 h-20 object-contain"
                      style={{ filter: `drop-shadow(0 2px 8px ${typeColors[selected2.type1]?.bg || '#666'}66)` }}
                      onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback='1'; e.target.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selected2.pokedexNumber}.png` } }}
                    />
                    <button
                      type="button"
                      onClick={() => { setSelected2(null); setSearch2('') }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500/30 text-red-400 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label="Change Pokémon"
                    >&times;</button>
                  </div>
                  <span className="text-sm font-semibold capitalize mt-1">{selected2.name}</span>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: typeColors[selected2.type1]?.bg, color: typeColors[selected2.type1]?.text }}>{selected2.type1}</span>
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center text-white/10 text-2xl">?</div>
              )}
            </div>
          </div>

          {/* Search for second Pokémon */}
          {!selected2 && (
            <div className="mb-4">
              <label htmlFor="compare-search" className="sr-only">Search Pokémon to compare</label>
              <input
                id="compare-search"
                type="search"
                value={search2}
                onChange={e => setSearch2(e.target.value)}
                placeholder="Search Pokémon to compare..."
                autoFocus
                autoComplete="off"
                className="w-full px-4 py-2 bg-white/5 border border-white/5 rounded-full text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
              />
              {suggestions.length > 0 && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {suggestions.map(p => (
                    <button
                      key={p.pokedexNumber}
                      type="button"
                      onClick={() => { setSelected2(p); setSearch2('') }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
                    >
                      <img src={getSpriteUrl(p.pokedexNumber)} alt="" loading="lazy" decoding="async" width={32} height={32}
                        className="w-8 h-8 object-contain"
                        onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback='1'; e.target.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.pokedexNumber}.png` } }}
                      />
                      <span className="text-xs capitalize text-white/50">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Radar Chart */}
          <div className="mb-6">
            <RadarChart pokemon={pokemon1} comparePokemon={selected2} />
            {selected2 && (
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors[pokemon1.type1]?.bg }} />
                  <span className="text-[10px] text-white/30 capitalize">{pokemon1.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors[selected2.type1]?.bg }} />
                  <span className="text-[10px] text-white/30 capitalize">{selected2.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stat comparison bars */}
          {selected2 && (
            <div>
              <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Stat Comparison</h3>
              <div className="space-y-2">
                {stats.map(({ label, val1, val2 }) => {
                  const max = Math.max(val1, val2, 1)
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-8 text-[10px] text-white/25 text-right uppercase">{label}</span>
                      <span className={`w-8 text-xs font-mono text-right tabular-nums ${val1 >= val2 ? 'text-white/60' : 'text-white/25'}`}>{val1}</span>
                      <div className="flex-1 flex gap-0.5 h-2">
                        <div className="flex-1 flex justify-end">
                          <div
                            className="h-full rounded-l-full"
                            style={{ width: `${(val1 / max) * 100}%`, backgroundColor: typeColors[pokemon1.type1]?.bg, opacity: val1 >= val2 ? 0.8 : 0.3 }}
                          />
                        </div>
                        <div className="flex-1">
                          <div
                            className="h-full rounded-r-full"
                            style={{ width: `${(val2 / max) * 100}%`, backgroundColor: typeColors[selected2.type1]?.bg, opacity: val2 >= val1 ? 0.8 : 0.3 }}
                          />
                        </div>
                      </div>
                      <span className={`w-8 text-xs font-mono tabular-nums ${val2 >= val1 ? 'text-white/60' : 'text-white/25'}`}>{val2}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-mono tabular-nums" style={{ color: getStatColor(pokemon1.baseTotal) }}>{pokemon1.baseTotal} total</span>
                <span className="text-white/15">vs</span>
                <span className="font-mono tabular-nums" style={{ color: getStatColor(selected2.baseTotal) }}>{selected2.baseTotal} total</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
