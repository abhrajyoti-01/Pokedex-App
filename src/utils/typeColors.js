export const typeColors = {
  fire: { bg: '#F08030', text: '#fff' },
  water: { bg: '#6890F0', text: '#fff' },
  grass: { bg: '#78C850', text: '#fff' },
  electric: { bg: '#F8D030', text: '#333' },
  ice: { bg: '#98D8D8', text: '#333' },
  fighting: { bg: '#C03028', text: '#fff' },
  poison: { bg: '#A040A0', text: '#fff' },
  ground: { bg: '#E0C068', text: '#333' },
  flying: { bg: '#A890F0', text: '#fff' },
  psychic: { bg: '#F85888', text: '#fff' },
  bug: { bg: '#A8B820', text: '#fff' },
  rock: { bg: '#B8A038', text: '#fff' },
  ghost: { bg: '#705898', text: '#fff' },
  dragon: { bg: '#7038F8', text: '#fff' },
  dark: { bg: '#705848', text: '#fff' },
  steel: { bg: '#B8B8D0', text: '#333' },
  fairy: { bg: '#EE99AC', text: '#333' },
  normal: { bg: '#A8A878', text: '#fff' },
}

export const allTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
]

export const generationLabels = {
  1: 'Gen I (Kanto)',
  2: 'Gen II (Johto)',
  3: 'Gen III (Hoenn)',
  4: 'Gen IV (Sinnoh)',
  5: 'Gen V (Unova)',
  6: 'Gen VI (Kalos)',
  7: 'Gen VII (Alola)',
}

export function getStatColor(value) {
  if (value >= 130) return '#22c55e'
  if (value >= 100) return '#84cc16'
  if (value >= 80) return '#eab308'
  if (value >= 60) return '#f97316'
  if (value >= 40) return '#ef4444'
  return '#dc2626'
}

export function getSpriteUrl(pokedexNumber) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokedexNumber}.png`
}

export function getShinyUrl(pokedexNumber) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokedexNumber}.png`
}

export function getCryUrl(pokedexNumber) {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokedexNumber}.ogg`
}
