import { useCallback } from 'react'

const statConfig = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'ATK' },
  { key: 'defense', label: 'DEF' },
  { key: 'spAttack', label: 'SP.A' },
  { key: 'spDefense', label: 'SP.D' },
  { key: 'speed', label: 'SPD' },
]

export default function StatSlider({ statRanges, onStatRangeChange }) {
  const handleChange = useCallback((stat, bound, value) => {
    const num = parseInt(value) || 0
    onStatRangeChange({
      ...statRanges,
      [stat]: { ...statRanges[stat], [bound]: num },
    })
  }, [statRanges, onStatRangeChange])

  const hasActiveFilter = statConfig.some(({ key }) => {
    const r = statRanges[key]
    return r.min > 0 || r.max < 255
  })

  return (
    <fieldset className="space-y-3 border-0 p-0 m-0">
      <legend className="text-[10px] text-white/30 uppercase tracking-widest">Stat range filters</legend>
      {hasActiveFilter && (
        <button
          type="button"
          onClick={() => {
            const reset = {}
            statConfig.forEach(({ key }) => { reset[key] = { min: 0, max: 255 } })
            onStatRangeChange(reset)
          }}
          className="text-[10px] text-white/20 hover:text-white/40 cursor-pointer transition-colors duration-150"
        >
          Reset ranges
        </button>
      )}
      {statConfig.map(({ key, label }) => {
        const range = statRanges[key]
        const isActive = range.min > 0 || range.max < 255
        return (
          <div key={key} className="flex items-center gap-2">
            <label className={`w-8 text-[10px] uppercase tracking-wider text-right ${isActive ? 'text-white/60' : 'text-white/20'}`}>
              {label}
            </label>
            <span className="sr-only">{label} minimum: {range.min}</span>
            <input
              type="range"
              min={0}
              max={255}
              value={range.min}
              onChange={e => handleChange(key, 'min', e.target.value)}
              aria-label={`${label} minimum`}
              className="flex-1 h-1 appearance-none bg-white/10 rounded-full outline-none
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/40 [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:hover:bg-white/60 [&::-webkit-slider-thumb]:transition-colors"
            />
            <span className="sr-only">{label} maximum: {range.max}</span>
            <input
              type="range"
              min={0}
              max={255}
              value={range.max}
              onChange={e => handleChange(key, 'max', e.target.value)}
              aria-label={`${label} maximum`}
              className="flex-1 h-1 appearance-none bg-white/10 rounded-full outline-none
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/40 [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:hover:bg-white/60 [&::-webkit-slider-thumb]:transition-colors"
            />
            <span className="w-12 text-[10px] text-white/25 font-mono text-right tabular-nums" aria-hidden="true">
              {range.min}–{range.max}
            </span>
          </div>
        )
      })}
    </fieldset>
  )
}
