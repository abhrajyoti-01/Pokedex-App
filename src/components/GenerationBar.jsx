import { generationLabels } from '../utils/typeColors'

const generations = [
  { value: '', label: 'All' },
  ...Object.entries(generationLabels).map(([value, label]) => ({
    value,
    label: label.replace('Gen ', '').split(' ')[0],
  })),
]

export default function GenerationBar({ generation, onGenerationChange }) {
  return (
    <ul
      className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      role="tablist"
      aria-label="Filter by generation"
    >
      {generations.map(gen => (
        <li key={gen.value} role="presentation">
          <button
            type="button"
            role="tab"
            aria-selected={generation === gen.value}
            onClick={() => onGenerationChange(gen.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium
              transition-[background-color,color] duration-150 cursor-pointer border whitespace-nowrap ${
              generation === gen.value
                ? 'bg-white/15 border-white/20 text-white'
                : 'bg-white/[0.03] border-white/[0.03] text-white/35 hover:bg-white/[0.06] hover:text-white/50'
            }`}
          >
            {gen.label}
          </button>
        </li>
      ))}
    </ul>
  )
}
