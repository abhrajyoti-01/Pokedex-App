import { allTypes } from '../utils/typeColors'

export default function FilterPanel({ filters, onFilterChange }) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div>
        <label htmlFor="type-filter" className="sr-only">Filter by type</label>
        <select
          id="type-filter"
          value={filters.type}
          onChange={e => onFilterChange({ ...filters, type: e.target.value })}
          className="bg-white/5 border border-white/5 rounded-full px-3 py-2 text-sm text-white
            focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer"
        >
          <option value="" className="bg-black">All Types</option>
          {allTypes.map(t => (
            <option key={t} value={t} className="bg-black capitalize">{t}</option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.legendary}
          onChange={e => onFilterChange({ ...filters, legendary: e.target.checked })}
          className="w-4 h-4 rounded accent-yellow-500"
        />
        <span className="text-yellow-400/70 text-xs">Legendary Only</span>
      </label>
    </div>
  )
}
