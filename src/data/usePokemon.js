import { useState, useEffect, useMemo } from 'react'
import Papa from 'papaparse'
import csvUrl from '../../pokemon.csv?url'

function parseAbilities(val) {
  if (!val) return []
  try {
    const parsed = JSON.parse(val.replace(/'/g, '"'))
    return Array.isArray(parsed) ? parsed : [val]
  } catch {
    return val.replace(/[\[\]']/g, '').split(',').map(s => s.trim()).filter(Boolean)
  }
}

function parseNumber(val) {
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

function parseAgainstKey(col) {
  return col.replace('against_', '')
}

export function usePokemon() {
  const [pokemon, setPokemon] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(csvUrl, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load Pokémon data')
        return res.text()
      })
      .then(text => {
        const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })

        const againstColumns = Object.keys(data[0] || {}).filter(k => k.startsWith('against_'))

        const processed = data.map(row => {
          const against = {}
          againstColumns.forEach(col => {
            against[parseAgainstKey(col)] = parseNumber(row[col])
          })

          return {
            pokedexNumber: parseNumber(row.pokedex_number),
            name: row.name,
            japaneseName: row.japanese_name,
            classification: row.classfication,
            type1: row.type1,
            type2: row.type2 || null,
            abilities: parseAbilities(row.abilities),
            hp: parseNumber(row.hp),
            attack: parseNumber(row.attack),
            defense: parseNumber(row.defense),
            spAttack: parseNumber(row.sp_attack),
            spDefense: parseNumber(row.sp_defense),
            speed: parseNumber(row.speed),
            baseTotal: parseNumber(row.base_total),
            height: parseNumber(row.height_m),
            weight: parseNumber(row.weight_kg),
            captureRate: parseNumber(row.capture_rate),
            baseHappiness: parseNumber(row.base_happiness),
            experienceGrowth: parseNumber(row.experience_growth),
            baseEggSteps: parseNumber(row.base_egg_steps),
            percentageMale: parseNumber(row.percentage_male),
            generation: parseNumber(row.generation),
            isLegendary: row.is_legendary === '1',
            against,
          }
        }).filter(p => p.pokedexNumber && p.name)

        processed.sort((a, b) => a.pokedexNumber - b.pokedexNumber)
        setPokemon(processed)
        setLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const pokemonMap = useMemo(() => {
    const map = new Map()
    for (const p of pokemon) {
      map.set(p.pokedexNumber, p)
    }
    return map
  }, [pokemon])

  return { pokemon, pokemonMap, loading, error }
}
