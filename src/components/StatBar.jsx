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
      <div
        className="flex-1 h-2.5 rounded-full overflow-hidden bg-black/40 border border-white/[0.06]"
        style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)' }}
      >
        <div
          className="pkx-bar h-full rounded-full relative"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(180deg, color-mix(in srgb, ${color} 55%, white 45%), ${color} 60%, color-mix(in srgb, ${color} 75%, black 25%) 100%)`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), 0 0 10px ${color}88`,
          }}
        />
      </div>
    </div>
  )
}
