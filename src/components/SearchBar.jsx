export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <label htmlFor="pokemon-search" className="sr-only">Search Pokémon</label>
      <input
        id="pokemon-search"
        type="search"
        placeholder="Search Pokémon..."
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        spellCheck="false"
        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-full
          text-white placeholder-white/20 text-sm
          focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20
          transition-[border-color,box-shadow] duration-150"
      />
    </div>
  )
}
