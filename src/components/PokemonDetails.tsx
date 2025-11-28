import { useState, useEffect } from 'react';
import type { Pokemon } from '../types/types';
import { Modal } from './Modal';
import { BoxForm } from './BoxForm';
import { PokemonAPI } from '../api/PokemonAPI';
import '../styles/PokemonDetails.css';

interface PokemonDetailsProps {
  pokemon: Pokemon | null;
  isOpen: boolean;
  onClose: () => void;
  api: PokemonAPI;
  onCatchSuccess?: () => void;
}

export const PokemonDetails = ({
  pokemon,
  isOpen,
  onClose,
  api,
  onCatchSuccess,
}: PokemonDetailsProps) => {
  const [showCatchForm, setShowCatchForm] = useState(false);
  const [detailedPokemon, setDetailedPokemon] = useState<Pokemon | null>(pokemon);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pokemon && isOpen) {
      setLoading(true);
      api.getPokemonByName(pokemon.name)
        .then(setDetailedPokemon)
        .catch(() => setDetailedPokemon(pokemon))
        .finally(() => setLoading(false));
    }
  }, [pokemon, isOpen, api]);

  if (!pokemon || !detailedPokemon) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={detailedPokemon.name.toUpperCase()}>
        {loading ? (
          <div className="pokemon-details-loading">Loading...</div>
        ) : (
          <div className="pokemon-details">
            <div className="pokemon-details-header">
              <div className="pokemon-sprites">
                <div className="sprite-container">
                  <img src={detailedPokemon.sprites.front_default} alt="Front" />
                  <span>Normal</span>
                </div>
                <div className="sprite-container">
                  <img src={detailedPokemon.sprites.front_shiny} alt="Shiny Front" />
                  <span>Shiny</span>
                </div>
              </div>
              <div className="pokemon-types">
                {detailedPokemon.types.map((type) => (
                  <span key={type.name} className="type-badge" style={{ backgroundColor: type.color }}>
                    {type.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="pokemon-description">
              <p>{detailedPokemon.description}</p>
            </div>

            <div className="pokemon-stats">
              <h3>Stats</h3>
              <div className="stats-grid">
                {Object.entries(detailedPokemon.stats).map(([key, value]) => (
                  <div key={key} className="stat-item">
                    <span className="stat-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="stat-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pokemon-moves">
              <h3>Moves</h3>
              <div className="moves-list">
                {detailedPokemon.moves.map((move, index) => (
                  <div key={index} className="move-item">
                    <span className="move-name">{move.name}</span>
                    {move.power !== undefined && <span className="move-power">Power: {move.power}</span>}
                    <span className="move-type" style={{ backgroundColor: move.type.color }}>
                      {move.type.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pokemon-actions">
              <button className="catch-button" onClick={() => setShowCatchForm(true)}>
                Add to Box
              </button>
            </div>
          </div>
        )}
      </Modal>

      {showCatchForm && (
        <BoxForm
          pokemon={detailedPokemon}
          api={api}
          isOpen={showCatchForm}
          onClose={() => setShowCatchForm(false)}
          onSuccess={() => {
            setShowCatchForm(false);
            onCatchSuccess?.();
          }}
        />
      )}
    </>
  );
};
