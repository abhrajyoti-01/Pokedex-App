import { allTypes, typeColors } from '../utils/typeColors'

function typeText(bg) {
  return `color-mix(in srgb, ${bg} 62%, white)`
}

function TypeChip({ active, label, bg, onClick, pressed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide
        transition-[transform,box-shadow,background-color] duration-200 cursor-pointer
        hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap ${active ? 'text-white' : ''}`}
      style={active
        ? {
            background: `linear-gradient(180deg, color-mix(in srgb, ${bg} 68%, white 32%), ${bg} 88%)`,
            color: '#fff',
            border: `1px solid color-mix(in srgb, ${bg} 55%, white)`,
            boxShadow: `0 8px 20px ${bg}55, inset 0 1px 0 rgba(255,255,255,0.4)`,
          }
        : {
            backgroundColor: `${bg}17`,
            color: typeText(bg),
            border: `1px solid ${bg}30`,
          }}
    >
      {label}
    </button>
  )
}

export default function TypeFilterBar({ type, legendary, onTypeChange, onLegendaryChange }) {
  return (
    <div role="group" aria-label="Filter by Pokémon type">
      <ul
        className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 pkx-noscroll"
        role="list"
      >
        <li role="listitem">
          <button
            type="button"
            onClick={() => onTypeChange('')}
            aria-pressed={type === ''}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide
              border cursor-pointer whitespace-nowrap
              transition-[transform,box-shadow,background-color] duration-200
              hover:-translate-y-0.5 active:translate-y-0 ${
                type === ''
                  ? 'bg-white/15 border-white/25 text-white shadow-[0_8px_20px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.3)]'
                  : 'bg-white/[0.04] border-white/[0.07] text-white/40 hover:bg-white/[0.07]'
              }`}
          >
            All Types
          </button>
        </li>

        {allTypes.map(t => (
          <li key={t} role="listitem">
            <TypeChip
              active={type === t}
              label={t}
              bg={typeColors[t].bg}
              onClick={() => onTypeChange(type === t ? '' : t)}
              pressed={type === t}
            />
          </li>
        ))}

        <li role="listitem">
          <button
            type="button"
            onClick={() => onLegendaryChange(!legendary)}
            aria-pressed={legendary}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
              uppercase tracking-wide border cursor-pointer whitespace-nowrap
              transition-[transform,box-shadow,background-color] duration-200
              hover:-translate-y-0.5 active:translate-y-0 ${
                legendary
                  ? 'bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-200 text-black shadow-[0_8px_20px_rgba(250,204,21,0.4),inset_0_1px_0_rgba(255,255,255,0.5)]'
                  : 'bg-white/[0.04] border-white/[0.07] text-white/40 hover:bg-white/[0.07]'
              }`}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
            </svg>
            Legendary
          </button>
        </li>
      </ul>
    </div>
  )
}
