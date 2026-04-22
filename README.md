# 🌌 Premium Pokédex App

A modern, high-end "OLED true-black" Pokédex built with React, Vite, and Tailwind CSS. Featuring 3D layered Pokémon cards, a sleek side-drawer detail view, and advanced filtering capabilities.

## ✨ Features

- **OLED True-Black Aesthetics:** Deep `#000` backgrounds with gorgeous radial gradients based on Pokémon types.
- **Gyroscopic 3D Tilt Cards:** Interactive 3D pop-out sprites that react to cursor movement with dynamic glare overlays.
- **Interactive Radar Charts:** Beautiful Spider/Radar charts visualizing Pokémon base stats scientifically.
- **Team Builder & Synergy Matrix:** Drag-and-drop team construction with an algorithmic weakness and resistance coverage matrix.
- **Refined Side-Drawer:** A smooth, full-height side-sliding modal for seamless data viewing.
- **Advanced Navigation & Filtering:** Swipeable pill-navigation for Generations, plus robust search, type filtering, and smart sorting.

## 🚀 Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (v4)
- **Data Parsing:** PapaParse (CSV integration)

## 🗺️ Application Architecture & Data Flow

```mermaid
graph TD
    subgraph Data Layer
        CSV[public/pokemon.csv] -->|Fetch & PapaParse| Hook[usePokemon.js]
        Hook -->|Returns: pokemon, loading, error| AppNode[App.jsx]
    end

    subgraph User Interface
        AppNode --> Header[Header Navigation]
        Header -->|Search / Filter| FilterState[(Filter & Sort States)]
        FilterState -->|Derives| FilteredData[Filtered Pokemon Array]
        
        AppNode --> Grid[PokemonGrid.jsx]
        FilteredData --> Grid
        
        Grid -->|Renders List| Card[PokemonCard.jsx]
        Card -->|onClick Select| Modal[PokemonModal.jsx / Side Drawer]
        Modal -->|Displays| Stats[StatBars & TypeBadges]
    end
    
    style CSV fill:#1a1a1a,stroke:#333,stroke-width:2px,color:#fff
    style Hook fill:#2a2a2a,stroke:#555,stroke-width:2px,color:#fff
    style AppNode fill:#16213e,stroke:#3b5998,stroke-width:2px,color:#fff
```

## 📦 Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.
