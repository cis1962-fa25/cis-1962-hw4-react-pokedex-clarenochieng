import type { Pokemon } from '../types/types';
import '../styles/PokemonCard.css';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick: () => void;
}

export const PokemonCard = ({ pokemon, onClick }: PokemonCardProps) => {
  return (
    <div className="pokemon-card" onClick={onClick}>
      <div className="pokemon-card-image">
        <img src={pokemon.sprites.front_default} alt={pokemon.name} />
      </div>
      <div className="pokemon-card-info">
        <h3 className="pokemon-card-name">{pokemon.name}</h3>
        <div className="pokemon-card-types">
          {pokemon.types.map((type) => (
            <span
              key={type.name}
              className="pokemon-type-badge"
              style={{ backgroundColor: type.color }}
            >
              {type.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
