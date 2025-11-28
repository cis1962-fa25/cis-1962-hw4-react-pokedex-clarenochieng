import { useState, useEffect } from 'react';
import { PokemonList } from './components/PokemonList';
import { PokemonDetails } from './components/PokemonDetails';
import { BoxList } from './components/BoxList';
import { PokemonAPI } from './api/PokemonAPI';
import type { Pokemon } from './types/types';
import './App.css';

const API = new PokemonAPI();
const JWT_TOKEN = 'INSERT_JWT_TOKEN';

function App() {
  const [view, setView] = useState<'pokemon' | 'box'>('pokemon');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [pokemonIdToName, setPokemonIdToName] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const tokenValue = JWT_TOKEN;
    if (tokenValue && tokenValue.trim() !== '' && !tokenValue.includes('INSERT_JWT_TOKEN')) {
      API.setToken(tokenValue);
    }

    const buildPokemonMap = async () => {
      try {
        const map = new Map<number, string>();
        for (let offset = 0; offset < 1000; offset += 50) {
          const pokemonList = await API.listPokemon(50, offset);
          pokemonList.forEach((p) => map.set(p.id, p.name));
          if (pokemonList.length < 50) break;
        }
        setPokemonIdToName(map);
      } catch {
      }
    };

    buildPokemonMap();
  }, []);

  const handlePokemonClick = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedPokemon(null);
  };

  const handleCatchSuccess = () => {
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Pokedex</h1>
        <nav className="app-nav">
          <button
            className={view === 'pokemon' ? 'active' : ''}
            onClick={() => setView('pokemon')}
          >
            All Pokemon
          </button>
          <button
            className={view === 'box' ? 'active' : ''}
            onClick={() => setView('box')}
          >
            My Box
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'pokemon' ? (
          <PokemonList api={API} onPokemonClick={handlePokemonClick} />
        ) : (
          <BoxList api={API} pokemonIdToName={pokemonIdToName} />
        )}
      </main>

      {selectedPokemon && (
        <PokemonDetails
          pokemon={selectedPokemon}
          isOpen={isDetailsOpen}
          onClose={handleCloseDetails}
          api={API}
          onCatchSuccess={handleCatchSuccess}
        />
      )}
    </div>
  );
}

export default App;