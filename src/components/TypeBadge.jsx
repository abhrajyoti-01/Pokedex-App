import { typeColors } from '../utils/typeColors'

export default function TypeBadge({ type, size = 'sm' }) {
  if (!type) return null
  const colors = typeColors[type] || { bg: '#888', text: '#fff' }
  const sizeClasses = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3.5 py-1'

  return (
    <span
      className={`inline-block rounded-full font-semibold uppercase tracking-wide ${sizeClasses} leading-tight`}
      style={{
        background: `linear-gradient(180deg, color-mix(in srgb, ${colors.bg} 62%, white 38%) 0%, ${colors.bg} 55%, color-mix(in srgb, ${colors.bg} 80%, black 20%) 100%)`,
        color: colors.text,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px ${colors.bg}66`,
        textShadow: `0 1px 1px rgba(0,0,0,${colors.text === '#fff' ? 0.35 : 0.15})`,
      }}
    >
      {type}
    </span>
  )
}
