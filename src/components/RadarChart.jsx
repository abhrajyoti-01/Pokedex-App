import { useMemo } from 'react'

const STAT_KEYS = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed']
const STAT_LABELS = ['HP', 'ATK', 'DEF', 'SP.A', 'SP.D', 'SPD']
const SIDES = 6
const ANGLE_STEP = (2 * Math.PI) / SIDES
const CENTER = 90
const MAX_R = 75

function getPoint(index, value, maxVal = 255) {
  const angle = -Math.PI / 2 + index * ANGLE_STEP
  const r = (Math.max(0, value) / maxVal) * MAX_R
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  }
}

function getLabelPos(index) {
  const angle = -Math.PI / 2 + index * ANGLE_STEP
  const r = MAX_R + 18
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  }
}

export default function RadarChart({ pokemon, comparePokemon }) {
  const polygons = useMemo(() => {
    const makePolygon = (stats, maxVal = 255) =>
      stats.map((s, i) => {
        const p = getPoint(i, s, maxVal)
        return `${p.x},${p.y}`
      }).join(' ')

    const stats = STAT_KEYS.map(k => pokemon[k] || 0)
    const result = [
      { points: makePolygon(stats), color: typeColors[pokemon.type1]?.bg || '#888', opacity: 0.35 },
    ]

    if (comparePokemon) {
      const cStats = STAT_KEYS.map(k => comparePokemon[k] || 0)
      result.push({
        points: makePolygon(cStats),
        color: typeColors[comparePokemon.type1]?.bg || '#888',
        opacity: 0.35,
      })
    }
    return result
  }, [pokemon, comparePokemon])

  const gridRings = [0.25, 0.5, 0.75, 1].map(frac => {
    const pts = Array.from({ length: SIDES }, (_, i) => {
      const p = getPoint(i, frac * 255)
      return `${p.x},${p.y}`
    })
    return pts.join(' ')
  })

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 180 180" className="w-full max-w-[220px]" role="img" aria-label={`Base stats radar chart for ${pokemon.name}${comparePokemon ? ` compared to ${comparePokemon.name}` : ''}`}>
        {gridRings.map((ring, i) => (
          <polygon
            key={i}
            points={ring}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: SIDES }, (_, i) => {
          const p = getPoint(i, 255)
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />
          )
        })}
        {polygons.map((poly, i) => (
          <polygon
            key={i}
            points={poly.points}
            fill={poly.color}
            fillOpacity={poly.opacity}
            stroke={poly.color}
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <animate
              attributeName="fill-opacity"
              from="0"
              to={String(poly.opacity)}
              dur="0.6s"
              fill="freeze"
            />
          </polygon>
        ))}
        {STAT_LABELS.map((label, i) => {
          const pos = getLabelPos(i)
          const val = pokemon[STAT_KEYS[i]]
          return (
            <g key={i}>
              <text
                x={pos.x}
                y={pos.y - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.35)"
                fontSize="8"
                fontWeight="600"
                letterSpacing="0.5"
              >
                {label}
              </text>
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.15)"
                fontSize="7"
                fontFamily="monospace"
              >
                {val}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

import { typeColors } from '../utils/typeColors'
