import { useCallback, useRef, useEffect } from 'react'
import { typeColors, getSpriteUrl } from '../utils/typeColors'
import TypeBadge from './TypeBadge'

function applyTilt(card, rotateX, rotateY) {
  if (!card) return
  card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  const glare = card.querySelector('[data-glare]')
  if (glare) {
    glare.style.background = `linear-gradient(${135 + rotateY * 5}deg, rgba(255,255,255,0.12) 0%, transparent 60%)`
    glare.style.opacity = '1'
  }
}

function resetTilt(card) {
  if (!card) return
  card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)'
  const glare = card.querySelector('[data-glare]')
  if (glare) glare.style.opacity = '0'
}

const MAX_TILT = 15
const GYROSCOPE_SCALE = 0.3

const PokemonCard = ({ pokemon, onClick }) => {
  const cardRef = useRef(null)
  const gyroActiveRef = useRef(false)
  const glow = typeColors[pokemon.type1]?.bg || '#666'

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    let rafId = null

    const handleOrientation = (e) => {
      if (e.gamma === null && e.beta === null) return
      gyroActiveRef.current = true
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const gamma = Math.max(-45, Math.min(45, e.gamma || 0))
        const beta = Math.max(-45, Math.min(45, (e.beta || 0) - 45))
        const rotateX = -(beta / 45) * MAX_TILT * GYROSCOPE_SCALE
        const rotateY = (gamma / 45) * MAX_TILT * GYROSCOPE_SCALE
        applyTilt(card, rotateX, rotateY)
      })
    }

    const handleVisibility = () => {
      if (document.hidden) resetTilt(card)
    }

    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        card.addEventListener('click', function requestGyro() {
          DeviceOrientationEvent.requestPermission().then(state => {
            if (state === 'granted') window.addEventListener('deviceorientation', handleOrientation)
          }).catch(() => {})
          card.removeEventListener('click', requestGyro)
        }, { once: true })
      } else {
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (gyroActiveRef.current) return
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    applyTilt(card, (0.5 - y) * MAX_TILT, (x - 0.5) * MAX_TILT)
  }, [])

  const handleTouchMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const touch = e.touches[0]
    if (!touch) return
    const rect = card.getBoundingClientRect()
    const x = (touch.clientX - rect.left) / rect.width
    const y = (touch.clientY - rect.top) / rect.height
    applyTilt(card, (0.5 - y) * MAX_TILT, (x - 0.5) * MAX_TILT)
  }, [])

  const handleLeave = useCallback(() => {
    if (gyroActiveRef.current) return
    resetTilt(cardRef.current)
  }, [])

  return (
    <article className="pt-12" style={{ contain: 'layout style' }}>
      <button
        ref={cardRef}
        type="button"
        onClick={() => onClick(pokemon)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        onTouchStart={handleLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleLeave}
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
