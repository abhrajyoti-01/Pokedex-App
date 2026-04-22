import { typeColors } from '../utils/typeColors'

export default function TypeBadge({ type, size = 'sm' }) {
  if (!type) return null
  const colors = typeColors[type] || { bg: '#888', text: '#fff' }
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span
      className={`inline-block rounded-full font-semibold uppercase tracking-wide ${sizeClasses} leading-tight`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
      role="text"
    >
      {type}
    </span>
  )
}
