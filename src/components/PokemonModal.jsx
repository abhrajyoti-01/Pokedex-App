import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { typeColors, getSpriteUrl, getShinyUrl, getCryUrl, getStatColor } from '../utils/typeColors'
import { getEvolutionChain } from '../utils/evolutions'
import TypeBadge from './TypeBadge'
import StatBar from './StatBar'
import RadarChart from './RadarChart'

const HERO_MAX_TILT = 7

export default function PokemonModal({ pokemon, pokemonMap, formsByBase, onClose, onSelectPokemon, onCompare }) {
  const [open, setOpen] = useState(false)
  const [shiny, setShiny] = useState(false)
  const [cryPlaying, setCryPlaying] = useState(false)
  const [showRadar, setShowRadar] = useState(false)
  const audioRef = useRef(null)
  const panelRef = useRef(null)
  const heroRef = useRef(null)
  const stageRef = useRef(null)
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
    if (!open || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    if (focusable.length) focusable[0].focus()
  }, [open, pokemon])

  useEffect(() => {
    if (!open) return
    const handleTab = (e) => {
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', handleTab)
    return () => window.removeEventListener('keydown', handleTab)
  }, [open])

  const glow = typeColors[pokemon.type1]?.bg || '#666'
  const glow2 = (pokemon.type2 && typeColors[pokemon.type2]?.bg) || glow

  const weaknessEntries = useMemo(() =>
    Object.entries(pokemon.against || {}).filter(([, val]) => val > 1).sort((a, b) => b[1] - a[1]),
  [pokemon])
  const resistanceEntries = useMemo(() =>
    Object.entries(pokemon.against || {}).filter(([, val]) => val < 1 && val > 0).sort((a, b) => a[1] - b[1]),
  [pokemon])
  const immuneEntries = useMemo(() =>
    Object.entries(pokemon.against || {}).filter(([, val]) => val === 0),
  [pokemon])

  const evolutionChain = useMemo(() => {
    const chain = getEvolutionChain(pokemon.pokedexNumber)
    return chain.map(id => pokemonMap.get(id) || { pokedexNumber: id, name: `#${id}`, type1: 'normal' })
  }, [pokemon.pokedexNumber, pokemonMap])

  const siblingForms = useMemo(() => {
    const baseId = pokemon.baseNumber ?? pokemon.pokedexNumber
    const list = []
    const base = baseId !== pokemon.pokedexNumber ? pokemonMap.get(baseId) : null
    if (base) list.push(base)
    for (const f of (formsByBase?.get(baseId) || [])) {
      if (f.pokedexNumber !== pokemon.pokedexNumber) list.push(f)
    }
    return list
  }, [pokemon, pokemonMap, formsByBase])

  const handleClose = useCallback(() => {
    setOpen(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const playCry = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    const audio = new Audio(getCryUrl(pokemon.baseNumber ?? pokemon.pokedexNumber))
    audioRef.current = audio
    setCryPlaying(true)
    audio.play().catch(() => {})
    audio.onended = () => setCryPlaying(false)
  }, [pokemon.pokedexNumber])

  const handleHeroMove = useCallback((e) => {
    const hero = heroRef.current
    const stage = stageRef.current
    if (!hero || !stage) return
    const rect = hero.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    stage.style.transform = `rotateX(${((0.5 - y) * HERO_MAX_TILT).toFixed(2)}deg) rotateY(${((x - 0.5) * HERO_MAX_TILT).toFixed(2)}deg)`
  }, [])

  const handleHeroLeave = useCallback(() => {
    if (stageRef.current) stageRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'
  }, [])

  const handleEvoClick = useCallback((evo) => {
    if (evo.pokedexNumber !== pokemon.pokedexNumber && evo.name && !evo.name.startsWith('#')) {
      onSelectPokemon(evo)
    }
  }, [pokemon.pokedexNumber, onSelectPokemon])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300"
      style={{ opacity: open ? 1 : 0 }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${pokemon.name} details`}
    >
      <div className="absolute inset-0 flex items-end sm:items-center justify-center pointer-events-none sm:p-6"
        style={{ perspective: '1400px' }}>
        <div
          ref={panelRef}
          className="pkx-pop pointer-events-auto relative w-full sm:max-w-3xl max-h-[94dvh] sm:max-h-[90vh]
            flex flex-col overflow-hidden rounded-t-[2rem] sm:rounded-[2rem]
            border border-white/10 bg-[#0a0c12]/95
            shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
          style={{
            transform: open ? 'translateY(0) scale(1)' : 'translateY(6%) scale(0.96)',
            opacity: open ? 1 : 0,
            transition: 'transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.1), opacity 0.3s ease',
            willChange: 'transform',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* type-tinted ambient wash */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(120% 60% at 50% 0%, ${glow}26, transparent 60%)` }}
            aria-hidden="true"
          />

          {/* floating control orbs */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
            <OrbButton onClick={handleClose} label="Close details panel">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </OrbButton>

            <div className="flex gap-2">
              <OrbButton onClick={() => onCompare(pokemon)} label="Compare with another Pokémon" title="Compare">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </OrbButton>
              <OrbButton
                onClick={() => setShiny(s => !s)}
                label={shiny ? 'Show normal sprite' : 'Show shiny sprite'}
                pressed={shiny}
                activeClass="bg-yellow-500/25 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
                </svg>
              </OrbButton>
              <OrbButton
                onClick={playCry}
                label={cryPlaying ? 'Playing cry' : 'Play cry'}
                pressed={cryPlaying}
                activeClass="bg-blue-500/25 text-blue-300 shadow-[0_0_18px_rgba(96,165,250,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </OrbButton>
            </div>
          </div>

          {/* 3D hero stage */}
          <div
            ref={heroRef}
            onMouseMove={handleHeroMove}
            onMouseLeave={handleHeroLeave}
            className="relative flex-shrink-0 pt-14 pb-4 px-6 flex flex-col items-center overflow-hidden"
            style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
          >
            <p className="text-xs text-white/25 font-mono mb-1" aria-label={`Pokédex number ${pokemon.baseNumber ?? pokemon.pokedexNumber}`}>
              #{String(pokemon.baseNumber ?? pokemon.pokedexNumber).padStart(3, '0')}
            </p>

            <div
              ref={stageRef}
              className="relative h-48 w-full max-w-xs sm:h-56"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.18s ease-out',
              }}
              aria-hidden="true"
            >
              {/* orbit ring + ambient glow — centered by wrapper, animated on inner layers */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 sm:w-52 sm:h-52 pointer-events-none"
                aria-hidden="true"
              >
                <div
                  className="pkx-ring absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, ${glow}88, transparent 25%, ${glow2}66, transparent 55%, ${glow}88)`,
                    maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
                    WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))',
                    opacity: 0.5,
                  }}
                />
                <div
                  className="pkx-pulse-glow absolute inset-0 rounded-full blur-2xl"
                  style={{ background: `radial-gradient(circle, ${glow}55, ${glow2}22 60%, transparent 75%)` }}
                />
              </div>

              {/* floating sprite */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateZ(55px)' }}>
                <div className="pkx-float">
                  <img
                    src={shiny ? getShinyUrl(pokemon.pokedexNumber) : getSpriteUrl(pokemon.pokedexNumber)}
                    alt={`${pokemon.name}${shiny ? ' shiny' : ''} artwork`}
                    width={160}
                    height={160}
                    decoding="async"
                    className={`w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-[0_26px_30px_rgba(0,0,0,0.7)] transition-[filter] duration-200 ${shiny ? 'brightness-110 saturate-130' : ''}`}
                    onError={(e) => { if (e.target.dataset.fallback) return; e.target.dataset.fallback = '1'; e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedexNumber}.png` }}
                  />
                </div>
              </div>

              {/* pedestal shadow */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-0 w-32 h-4 rounded-[100%] blur-md"
                style={{ background: `radial-gradient(ellipse, ${glow}30, rgba(0,0,0,0.55) 40%, transparent 75%)` }}
              />
            </div>

            <h2 className="text-3xl font-bold capitalize mt-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">{pokemon.name}</h2>
            <p className="text-white/30 text-xs">{pokemon.classification}</p>

            <div className="flex gap-2 mt-2" role="list" aria-label="Types">
              <div role="listitem"><TypeBadge type={pokemon.type1} size="md" /></div>
              {pokemon.type2 && <div role="listitem"><TypeBadge type={pokemon.type2} size="md" /></div>}
            </div>

            {pokemon.isLegendary && (
              <span className="mt-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest
                border border-yellow-300/40 text-yellow-300 bg-yellow-400/10
                shadow-[0_0_16px_rgba(250,204,21,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]">
                Legendary
              </span>
            )}
          </div>

          {/* scrollable detail panels */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-8 pt-2" role="region" aria-label="Pokémon details">
            <div className="pkx-rise" style={{ animationDelay: '0.05s' }}>
              <Card>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <InfoItem label="Height" value={pokemon.height ? `${pokemon.height} m` : '—'} />
                  <InfoItem label="Weight" value={pokemon.weight ? `${pokemon.weight} kg` : '—'} />
                  <InfoItem label="Capture Rate" value={pokemon.captureRate ?? '—'} />
                  <InfoItem label="Base Happiness" value={pokemon.baseHappiness ?? '—'} />
                  <InfoItem label="Base Total" value={pokemon.baseTotal ?? '—'} />
                  <InfoItem label="Generation" value={`Gen ${pokemon.generation}`} />
                  <InfoItem label="Egg Steps" value={pokemon.baseEggSteps?.toLocaleString() ?? '—'} />
                  <InfoItem label="Gender" value={pokemon.percentageMale === null ? 'Genderless' : `${pokemon.percentageMale}% M / ${100 - pokemon.percentageMale}% F`} />
                </dl>
              </Card>
            </div>

            {evolutionChain.length > 1 && (
              <div className="pkx-rise" style={{ animationDelay: '0.1s' }}>
                <Card title="Evolution Chain">
                  <nav className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-1 pkx-noscroll" aria-label="Evolution chain">
                    {evolutionChain.map((evo, idx) => (
                      <div key={evo.pokedexNumber} className="flex items-center gap-1 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => handleEvoClick(evo)}
                          disabled={evo.pokedexNumber === pokemon.pokedexNumber}
                          aria-label={`View ${evo.name}${evo.pokedexNumber === pokemon.pokedexNumber ? ' (current)' : ''}`}
                          aria-current={evo.pokedexNumber === pokemon.pokedexNumber ? 'true' : undefined}
                          className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border cursor-pointer
                            transition-[transform,box-shadow,background-color] duration-200
                            hover:-translate-y-1 disabled:cursor-default
                            ${evo.pokedexNumber === pokemon.pokedexNumber
                              ? 'bg-white/10 border-white/25 shadow-[0_10px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]'
                              : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:shadow-[0_12px_26px_rgba(0,0,0,0.45)]'}`}
                        >
                          <img src={getSpriteUrl(evo.pokedexNumber)} alt={evo.name} loading="lazy" decoding="async" width={48} height={48}
                            className={`w-12 h-12 object-contain transition-transform duration-200 ${evo.pokedexNumber === pokemon.pokedexNumber ? 'drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]' : 'opacity-60'}`}
                            onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback='1'; e.target.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.pokedexNumber}.png` } }}
                          />
                          <span className={`text-[10px] capitalize leading-none ${evo.pokedexNumber === pokemon.pokedexNumber ? 'text-white' : 'text-white/40'}`}>{evo.name}</span>
                        </button>
                        {idx < evolutionChain.length - 1 && (
                          <svg className="w-4 h-4 text-white/10 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </nav>
                </Card>
              </div>
            )}

            {siblingForms.length > 0 && (
              <div className="pkx-rise" style={{ animationDelay: '0.1s' }}>
                <Card title="Other Forms">
                  <div className="flex flex-wrap gap-2 justify-center py-1">
                    {siblingForms.map(f => (
                      <button
                        key={f.pokedexNumber}
                        type="button"
                        onClick={() => handleEvoClick(f)}
                        aria-label={`View ${f.name}`}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer
                          bg-white/[0.03] border border-white/[0.06]
                          transition-[transform,box-shadow,background-color] duration-200
                          hover:-translate-y-0.5 hover:bg-white/[0.07] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                      >
                        <img src={getSpriteUrl(f.pokedexNumber)} alt="" loading="lazy" decoding="async" width={32} height={32}
                          className="w-8 h-8 object-contain"
                          onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback='1'; e.target.src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${f.pokedexNumber}.png` } }}
                        />
                        <span className="text-[10px] text-white/60 whitespace-nowrap">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            <div className="pkx-rise" style={{ animationDelay: '0.15s' }}>
              <Card title="Abilities">
                <ul className="flex flex-wrap gap-2" role="list">
                  {pokemon.abilities.map(a => (
                    <li key={a} className="px-3 py-1 rounded-full text-xs list-none
                      bg-white/[0.05] border border-white/[0.08]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_3px_8px_rgba(0,0,0,0.3)]">{a}</li>
                  ))}
                </ul>
              </Card>
            </div>

            <div className="pkx-rise" style={{ animationDelay: '0.2s' }}>
              <Card title="Base Stats">
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setShowRadar(false)}
                    className={`px-2.5 py-1 rounded-full text-[10px] transition-colors cursor-pointer ${!showRadar ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]' : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'}`}
                  >
                    Bars
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRadar(true)}
                    className={`px-2.5 py-1 rounded-full text-[10px] transition-colors cursor-pointer ${showRadar ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]' : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'}`}
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
                  <span className="text-lg font-bold drop-shadow-[0_0_12px_currentColor]" style={{ color: getStatColor(pokemon.baseTotal) }}>{pokemon.baseTotal}</span>
                </div>
              </Card>
            </div>

            <div className="pkx-rise" style={{ animationDelay: '0.25s' }}>
              <Card title="Type Effectiveness">
                <div className="space-y-3">
                  {weaknessEntries.length > 0 && <EffectivenessSection title="Weak To" entries={weaknessEntries} tone="#f87171" />}
                  {resistanceEntries.length > 0 && <EffectivenessSection title="Resists" entries={resistanceEntries} tone="#4ade80" />}
                  {immuneEntries.length > 0 && <EffectivenessSection title="Immune To" entries={immuneEntries} tone="#94a3b8" />}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrbButton({ children, onClick, label, title, pressed, activeClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={title}
      className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer
        transition-[background-color,box-shadow,transform] duration-200
        hover:bg-white/15 hover:scale-105 active:scale-95 ${pressed ? activeClass : 'bg-white/[0.07] border border-white/10 text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.4)]'}`}
    >
      {children}
    </button>
  )
}

function Card({ title, children }) {
  const heading = title ? (
    <h3 id={`section-${title.replace(/\s/g, '-')}`} className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">{title}</h3>
  ) : null
  return (
    <section className="pkx-glass rounded-2xl p-4 mb-4" aria-labelledby={title ? `section-${title.replace(/\s/g, '-')}` : undefined}>
      {heading}
      {children}
    </section>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="bg-black/30 border border-white/[0.05] rounded-xl px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <dt className="text-[9px] text-white/20 uppercase tracking-widest">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

function EffectivenessSection({ title, entries, tone }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: tone }}>{title}</h4>
      <ul className="flex flex-wrap gap-1.5" role="list">
        {entries.map(([type, mult]) => {
          const color = typeColors[type]?.bg || '#888'
          return (
            <li key={type} className="text-[11px] px-2 py-0.5 rounded-full list-none
              shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.35)]"
              style={{
                backgroundColor: `${color}1c`,
                color: `color-mix(in srgb, ${color} 55%, white)`,
                border: `1px solid ${color}38`,
              }}>
              <span className="capitalize">{type}</span>
              <span className="text-white/25 ml-1">{mult === 0 ? '0' : mult}x</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
