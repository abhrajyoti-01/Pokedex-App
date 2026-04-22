import { getStatColor } from '../utils/typeColors'

export default function StatBar({ label, value, max = 255 }) {
  const pct = Math.min((value / max) * 100, 100)
  const color = getStatColor(value)

  return (
    <div
      className="flex items-center gap-3"
      role="meter"
      aria-label={`${label} stat`}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span className="w-16 text-[10px] text-white/25 uppercase tracking-widest text-right select-none">
        {label}
      </span>
      <span className="w-7 text-xs font-mono text-right text-white/50 tabular-nums">{value}</span>
      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}66`,
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>
    </div>
  )
}
