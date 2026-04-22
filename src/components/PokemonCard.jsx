import { useCallback, useRef } from 'react'
import { typeColors, getSpriteUrl } from '../utils/typeColors'
import TypeBadge from './TypeBadge'

const PokemonCard = ({ pokemon, onClick }) => {
  const cardRef = useRef(null)
  const glow = typeColors[pokemon.type1]?.bg || '#666'

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateX = (0.5 - y) * 15
    const rotateY = (x - 0.5) * 15
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    const glare = card.querySelector('[data-glare]')
    if (glare) {
      glare.style.background = `linear-gradient(${135 + rotateY * 5}deg, rgba(255,255,255,0.12) 0%, transparent 60%)`
      glare.style.opacity = '1'
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)'
    const glare = card.querySelector('[data-glare]')
    if (glare) glare.style.opacity = '0'
  }, [])

  return (
    <article className="pt-12" style={{ contain: 'layout style' }}>
      <button
        ref={cardRef}
        type="button"
        onClick={() => onClick(pokemon)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-label={`${pokemon.name}, number ${pokemon.pokedexNumber}. ${pokemon.type1}${pokemon.type2 ? ` and ${pokemon.type2}` : ''} type.`}
        className="group relative w-full flex flex-col items-center pt-16 pb-4 px-3 rounded-2xl border border-white/5
          bg-[#0a0a0a] overflow-visible
          hover:border-white/15
          transition-[border-color,box-shadow] duration-200
          cursor-pointer"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        <span className="absolute top-2 right-3 text-[10px] font-mono text-white/20 select-none" aria-hidden="true">
          #{String(pokemon.pokedexNumber).padStart(3, '0')}
        </span>

        <div
          className="absolute inset-0 rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-200 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 20%, ${glow}55, transparent 70%)` }}
          aria-hidden="true"
        />

        <div
          data-glare
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{ opacity: 0 }}
          aria-hidden="true"
        />

        <img
          src={getSpriteUrl(pokemon.pokedexNumber)}
          alt=""
          loading="lazy"
          decoding="async"
          width={96}
          height={96}
          style={{ viewTransitionName: `sprite-${pokemon.pokedexNumber}`, contain: 'layout' }}
          className="absolute -top-12 w-24 h-24 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]
            group-hover:scale-110 group-hover:-translate-y-1 will-change-transform
            transition-transform duration-200 z-10"
          onError={(e) => {
            if (e.target.dataset.fallback) return
            e.target.dataset.fallback = '1'
            e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedexNumber}.png`
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-1.5 mt-4">
          <h3 className="text-sm font-semibold capitalize leading-tight">{pokemon.name}</h3>
          <div className="flex gap-1.5">
            <TypeBadge type={pokemon.type1} />
            {pokemon.type2 && <TypeBadge type={pokemon.type2} />}
          </div>
        </div>
      </button>
    </article>
  )
}

export default PokemonCard
