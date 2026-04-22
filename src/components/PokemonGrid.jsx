import { useState, useEffect, useRef, useCallback, memo } from 'react'
import PokemonCard from './PokemonCard'
import SkeletonCard from './SkeletonCard'

const PAGE_SIZE = 24

export default function PokemonGrid({ pokemon, onSelect }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loaderRef = useRef(null)

  const visible = pokemon.slice(0, visibleCount)
  const hasMore = visibleCount < pokemon.length

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, pokemon.length))
  }, [pokemon.length])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [pokemon])

  useEffect(() => {
    if (!loaderRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '400px' }
    )

    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (pokemon.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/30" role="status">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg">No Pokémon found</p>
        <p className="text-sm mt-1 text-white/15">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <section aria-label="Pokémon list">
      <p className="text-xs text-white/20 mb-6" role="status" aria-live="polite">
        Showing {visible.length} of {pokemon.length} Pokémon
      </p>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        role="list"
      >
        {visible.map(p => (
          <div key={p.pokedexNumber} role="listitem">
            <PokemonCard pokemon={p} onClick={onSelect} />
          </div>
        ))}
        {hasMore && Array.from({ length: Math.min(6, pokemon.length - visibleCount) }).map((_, i) => (
          <SkeletonCard key={`skel-${i}`} />
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center py-8" role="status" aria-label="Loading more Pokémon">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
        </div>
      )}
    </section>
  )
}
