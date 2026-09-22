import { useCallback, useRef, useEffect, memo } from 'react'
import { typeColors, getSpriteUrl } from '../utils/typeColors'
import TypeBadge from './TypeBadge'

const MAX_TILT = 12
const GYROSCOPE_SCALE = 0.3

function applyTilt(card, rotateX, rotateY, px, py) {
  if (!card) return
  card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  card.style.setProperty('--px', px.toFixed(3))
  card.style.setProperty('--py', py.toFixed(3))
  const glare = card.querySelector('[data-glare]')
  if (glare) {
    glare.style.background = `radial-gradient(circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.16), transparent 55%)`
    glare.style.opacity = '1'
  }
}

function resetTilt(card) {
  if (!card) return
  card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
  card.style.setProperty('--px', '0')
  card.style.setProperty('--py', '0')
  const glare = card.querySelector('[data-glare]')
  if (glare) glare.style.opacity = '0'
}

const PokemonCard = memo(({ pokemon, onClick }) => {
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
        applyTilt(card, rotateX, rotateY, gamma / 45, beta / 45)
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
    applyTilt(card, (0.5 - y) * MAX_TILT, (x - 0.5) * MAX_TILT, x - 0.5, y - 0.5)
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
        onTouchEnd={handleLeave}
        aria-label={`${pokemon.name}, number ${pokemon.pokedexNumber}. ${pokemon.type1}${pokemon.type2 ? ` and ${pokemon.type2}` : ''} type.`}
        className="group relative w-full flex flex-col items-center pt-16 pb-4 px-3 rounded-2xl
          border border-white/[0.07] overflow-visible cursor-pointer
          bg-[#0b0d13]
          transition-[border-color,box-shadow] duration-200
          hover:border-white/20"
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          boxShadow: `0 14px 34px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        {/* depth glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 18%, ${glow}40, transparent 72%)` }}
          aria-hidden="true"
        />

        {/* holographic sheen */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden transition-opacity duration-300"
          aria-hidden="true"
        >
          <div className="pkx-sheen absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* pointer glare */}
        <div
          data-glare
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{ opacity: 0 }}
          aria-hidden="true"
        />

        {/* number — near depth */}
        {!pokemon.baseNumber && (
          <span
            className="absolute top-2 right-3 text-[10px] font-mono text-white/20 select-none"
            style={{ transform: 'translateZ(18px)' }}
            aria-hidden="true"
          >
            #{String(pokemon.pokedexNumber).padStart(3, '0')}
          </span>
        )}

        {pokemon.baseNumber && (
          <span
            className="absolute top-2 right-3 text-[9px] uppercase tracking-widest text-white/25 select-none"
            style={{ transform: 'translateZ(18px)' }}
            aria-hidden="true"
          >
            Form
          </span>
        )}

        {/* sprite — pops out of the card, parallaxes with pointer */}
        <div
          className="absolute -top-12 left-1/2 -ml-12 w-24 h-24 pointer-events-none"
          style={{
            transform: 'translateZ(58px) translate3d(calc(var(--px, 0) * 14px), calc(var(--py, 0) * 9px), 0)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <div className="pkx-float-soft w-full h-full">
            <img
              src={getSpriteUrl(pokemon.pokedexNumber)}
              alt=""
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              width={96}
              height={96}
              className="w-24 h-24 object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.65)]"
              onError={(e) => {
                if (e.target.dataset.fallback) return
                e.target.dataset.fallback = '1'
                e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedexNumber}.png`
              }}
            />
          </div>
        </div>

        {/* name + types — mid depth */}
        <div
          className="relative z-10 flex flex-col items-center gap-1.5 mt-4"
          style={{
            transform: 'translateZ(26px) translate3d(calc(var(--px, 0) * 5px), calc(var(--py, 0) * 3px), 0)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <h3 className="text-sm font-semibold capitalize leading-tight">{pokemon.name}</h3>
          <div className="flex gap-1.5">
            <TypeBadge type={pokemon.type1} />
            {pokemon.type2 && <TypeBadge type={pokemon.type2} />}
          </div>
        </div>
      </button>
    </article>
  )
})

export default PokemonCard