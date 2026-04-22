export default function SortControls({ sort, onSortChange }) {
  const options = [
    { value: 'number_asc', label: '# Ascending' },
    { value: 'number_desc', label: '# Descending' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'hp_desc', label: 'Highest HP' },
    { value: 'attack_desc', label: 'Highest Attack' },
    { value: 'defense_desc', label: 'Highest Defense' },
    { value: 'spAttack_desc', label: 'Highest Sp. Atk' },
    { value: 'spDefense_desc', label: 'Highest Sp. Def' },
    { value: 'speed_desc', label: 'Highest Speed' },
    { value: 'baseTotal_desc', label: 'Highest Total' },
  ]

  return (
    <div>
      <label htmlFor="sort-select" className="sr-only">Sort Pokémon</label>
      <select
        id="sort-select"
        value={sort}
        onChange={e => onSortChange(e.target.value)}
        className="bg-white/5 border border-white/5 rounded-full px-3 py-2 text-sm text-white
          focus:outline-none focus:ring-1 focus:ring-white/20 cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-black">{o.label}</option>
        ))}
      </select>
    </div>
  )
}
