import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { typeColors, getSpriteUrl, getShinyUrl, getCryUrl, getStatColor } from '../utils/typeColors'
import { getEvolutionChain } from '../utils/evolutions'
import TypeBadge from './TypeBadge'
import StatBar from './StatBar'
import RadarChart from './RadarChart'

export default function PokemonModal({ pokemon, pokemonMap, onClose, onSelectPokemon, onCompare }) {
  const [open, setOpen] = useState(false)
  const [shiny, setShiny] = useState(false)
  const [cryPlaying, setCryPlaying] = useState(false)
  const [showRadar, setShowRadar] = useState(false)
  const audioRef = useRef(null)
  const drawerRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    setShiny(false)
    setCryPlaying(false)
    setShowRadar(false)
    requestAnimationFrame(() => setOpen(true))
    document.body.style.overflow = 'hidden'
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
      if (previousFocusRef.current) previousFocusRef.current.focus()
    }
  }, [pokemon, onClose])

  useEffect(() => {
    if (!open || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    if (focusable.length) focusable[0].focus()
  }, [open, pokemon])

  useEffect(() => {
    if (!open) return
    const handleTab = (e) => {
      if (e.key !== 'Tab' || !drawerRef.current) return
      const focusable = drawerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', handleTab)
    return () => window.removeEventListener('keydown', handleTab)
  }, [open])

  if (!pokemon) return null

  const glow = typeColors[pokemon.type1]?.bg || '#666'
  const weaknessEntries = Object.entries(pokemon.against).filter(([, val]) => val > 1).sort((a, b) => b[1] - a[1])
  const resistanceEntries = Object.entries(pokemon.against).filter(([, val]) => val < 1 && val > 0).sort((a, b) => a[1] - b[1])
  const immuneEntries = Object.entries(pokemon.against).filter(([, val]) => val === 0)

  const evolutionChain = useMemo(() => {
    const chain = getEvolutionChain(pokemon.pokedexNumber)
    return chain.map(id => pokemonMap.get(id) || { pokedexNumber: id, name: `#${id}`, type1: 'normal' })
  }, [pokemon.pokedexNumber, pokemonMap])

  const handleClose = useCallback(() => {
    setOpen(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const playCry = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    const audio = new Audio(getCryUrl(pokemon.pokedexNumber))
    audioRef.current = audio
    setCryPlaying(true)
    audio.play().catch(() => {})
    audio.onended = () => setCryPlaying(false)
  }, [pokemon.pokedexNumber])

  const handleEvoClick = useCallback((evo) => {
    if (evo.pokedexNumber !== pokemon.pokedexNumber && evo.name && !evo.name.startsWith('#')) {
      onSelectPokemon(evo)
    }
  }, [pokemon.pokedexNumber, onSelectPokemon])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      style={{ opacity: open ? 1 : 0 }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${pokemon.name} details`}
    >
      <div
        ref={drawerRef}
        className="fixed inset-y-0 right-0 w-full sm:max-w-md h-full bg-[#0a0a0a] border-l border-white/5 
          flex flex-col overflow-hidden will-change-transform
          transition-transform duration-300 ease-out rounded-l-3xl"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Hero header */}
        <div
          className="relative flex-shrink-0 pt-8 pb-6 px-6 flex flex-col items-center"
          style={{ background: `linear-gradient(to bottom, ${glow}22, transparent)` }}
        >
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close details panel"
              className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors duration-150 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onCompare(pokemon)}
                aria-label="Compare with another Pokémon"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors duration-150 cursor-pointer"
                title="Compare"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShiny(s => !s)}
                aria-label={shiny ? 'Show normal sprite' : 'Show shiny sprite'}
                aria-pressed={shiny}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150 cursor-pointer ${shiny ? 'bg-yellow-500/20' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <svg className={`w-3.5 h-3.5 ${shiny ? 'text-yellow-400' : ''}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={playCry}
                aria-label={cryPlaying ? 'Playing cry' : 'Play cry'}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150 cursor-pointer ${cryPlaying ? 'bg-blue-500/20' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <svg className={`w-3.5 h-3.5 ${cryPlaying ? 'text-blue-400' : ''}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
            </div>
          </div>

          <p className="text-xs text-white/25 font-mono mb-2 mt-4" aria-label={`Pokédex number ${pokemon.pokedexNumber}`}>
            #{String(pokemon.pokedexNumber).padStart(3, '0')}
          </p>

          <div
            className="w-36 h-36 flex items-center justify-center"
            style={{ background: `radial-gradient(circle, ${glow}33, transparent 70%)` }}
            aria-hidden="true"
          >
            <img
              src={shiny ? getShinyUrl(pokemon.pokedexNumber) : getSpriteUrl(pokemon.pokedexNumber)}
              alt={`${pokemon.name}${shiny ? ' shiny' : ''} sprite`}
              loading="lazy"
              decoding="async"
              width={128}
              height={128}
              style={{ viewTransitionName: `sprite-${pokemon.pokedexNumber}` }}
              className={`w-32 h-32 object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)] transition-[filter] duration-200 ${shiny ? 'brightness-110 saturate-130' : ''}`}
              onError={(e) => { if (e.target.dataset.fallback) return; e.target.dataset.fallback = '1'; e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedexNumber}.png` }}
            />
          </div>

          <h2 className="text-2xl font-bold capitalize mt-2">{pokemon.name}</h2>
          <p className="text-white/30 text-xs">{pokemon.classification}</p>

          <div className="flex gap-2 mt-2" role="list" aria-label="Types">
            <div role="listitem"><TypeBadge type={pokemon.type1} size="md" /></div>
            {pokemon.type2 && <div role="listitem"><TypeBadge type={pokemon.type2} size="md" /></div>}
          </div>

          {pokemon.isLegendary && (
            <span className="mt-2 px-3 py-1 bg-yellow-500/10 text-yellow-400/80 text-[10px] font-semibold rounded-full uppercase tracking-widest">Legendary</span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-8" role="region" aria-label="Pokémon details">
          <dl className="grid grid-cols-2 gap-2 mt-4 mb-6">
            <InfoItem label="Height" value={pokemon.height ? `${pokemon.height} m` : '—'} />
            <InfoItem label="Weight" value={pokemon.weight ? `${pokemon.weight} kg` : '—'} />
            <InfoItem label="Capture Rate" value={pokemon.captureRate ?? '—'} />
            <InfoItem label="Base Happiness" value={pokemon.baseHappiness ?? '—'} />
            <InfoItem label="Base Total" value={pokemon.baseTotal ?? '—'} />
            <InfoItem label="Generation" value={`Gen ${pokemon.generation}`} />
            <InfoItem label="Egg Steps" value={pokemon.baseEggSteps?.toLocaleString() ?? '—'} />
            <InfoItem label="Gender" value={pokemon.percentageMale === null ? 'Genderless' : `${pokemon.percentageMale}% M / ${100 - pokemon.percentageMale}% F`} />
          </dl>

          {evolutionChain.length > 1 && (
            <Section title="Evolution Chain">
              <nav className="flex items-center justify-center gap-2 overflow-x-auto py-2" aria-label="Evolution chain">
                {evolutionChain.map((evo, idx) => (
                  <div key={evo.pokedexNumber} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEvoClick(evo)}
                      disabled={evo.pokedexNumber === pokemon.pokedexNumber}
                      aria-label={`View ${evo.name}${evo.pokedexNumber === pokemon.pokedexNumber ? ' (current)' : ''}`}
                      aria-current={evo.pokedexNumber === pokemon.pokedexNumber ? 'true' : undefined}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors duration-150 cursor-pointer disabled:cursor-default ${evo.pokedexNumber === pokemon.pokedexNumber ? 'bg-white/10' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}
                    >
                      <img src={getSpriteUrl(evo.pokedexNumber)} alt={evo.name} loading="lazy" decoding="async" width={48} height={48}
                        className={`w-12 h-12 object-contain transition-opacity duration-150 ${evo.pokedexNumber === pokemon.pokedexNumber ? 'drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]' : 'opacity-50'}`}
                        onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback='1'; e.target.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.pokedexNumber}.png` } }}
                      />
                      <span className={`text-[10px] capitalize leading-none ${evo.pokedexNumber === pokemon.pokedexNumber ? 'text-white' : 'text-white/30'}`}>{evo.name}</span>
                    </button>
                    {idx < evolutionChain.length - 1 && (
                      <svg className="w-4 h-4 text-white/10 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </nav>
            </Section>
          )}

          <Section title="Abilities">
            <ul className="flex flex-wrap gap-2" role="list">
              {pokemon.abilities.map(a => <li key={a} className="px-3 py-1 bg-white/5 rounded-full text-xs list-none">{a}</li>)}
            </ul>
          </Section>

          <Section title="Base Stats">
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setShowRadar(false)}
                className={`px-2.5 py-1 rounded-full text-[10px] transition-colors cursor-pointer ${!showRadar ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'}`}
              >
                Bars
              </button>
              <button
                type="button"
                onClick={() => setShowRadar(true)}
                className={`px-2.5 py-1 rounded-full text-[10px] transition-colors cursor-pointer ${showRadar ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'}`}
              >
                Radar
              </button>
            </div>

            {showRadar ? (
              <RadarChart pokemon={pokemon} />
            ) : (
              <div className="space-y-2">
                <StatBar label="HP" value={pokemon.hp} />
                <StatBar label="Attack" value={pokemon.attack} />
                <StatBar label="Defense" value={pokemon.defense} />
                <StatBar label="Sp. Atk" value={pokemon.spAttack} />
                <StatBar label="Sp. Def" value={pokemon.spDefense} />
                <StatBar label="Speed" value={pokemon.speed} />
              </div>
            )}
            <div className="mt-3 flex items-center gap-3">
              <span className="text-[10px] text-white/25 uppercase tracking-wide w-24 text-right">Total</span>
              <span className="text-lg font-bold" style={{ color: getStatColor(pokemon.baseTotal) }}>{pokemon.baseTotal}</span>
            </div>
          </Section>

          <Section title="Type Effectiveness">
            <div className="space-y-3">
              {weaknessEntries.length > 0 && <EffectivenessSection title="Weak To" entries={weaknessEntries} colorClass="text-red-400/70" />}
              {resistanceEntries.length > 0 && <EffectivenessSection title="Resists" entries={resistanceEntries} colorClass="text-green-400/70" />}
              {immuneEntries.length > 0 && <EffectivenessSection title="Immune To" entries={immuneEntries} colorClass="text-white/30" />}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mb-6" aria-labelledby={`section-${title.replace(/\s/g, '-')}`}>
      <h3 id={`section-${title.replace(/\s/g, '-')}`} className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">{title}</h3>
      {children}
    </section>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="bg-white/[0.03] rounded-xl px-3 py-2">
      <dt className="text-[9px] text-white/20 uppercase tracking-widest">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

function EffectivenessSection({ title, entries, colorClass }) {
  return (
    <div>
      <h4 className={`text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${colorClass}`}>{title}</h4>
      <ul className="flex flex-wrap gap-1" role="list">
        {entries.map(([type, mult]) => (
          <li key={type} className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.03] flex items-center gap-1 list-none">
            <span className="capitalize">{type}</span>
            <span className="text-white/20">{mult === 0 ? '0' : mult}x</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
