import { useState, useEffect, useCallback } from 'react';
import type { Pokemon } from '../types/types';
import { PokemonCard } from './PokemonCard';
import { PokemonAPI } from '../api/PokemonAPI';
import '../styles/PokemonList.css';

interface PokemonListProps {
  api: PokemonAPI;
  onPokemonClick: (pokemon: Pokemon) => void;
  pageSize?: number;
}

export const PokemonList = ({
  api,
  onPokemonClick,
  pageSize = 10,
}: PokemonListProps) => {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchPokemon = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const offset = page * pageSize;
      const data = await api.listPokemon(pageSize, offset);
      setPokemon(data);
      setHasMore(data.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Pokemon');
    } finally {
      setLoading(false);
    }
  }, [api, pageSize]);

  useEffect(() => {
    fetchPokemon(currentPage);
  }, [currentPage, fetchPokemon]);

  const handlePrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (hasMore) setCurrentPage(currentPage + 1);
  };

  if (loading && pokemon.length === 0) {
    return (
      <div className="pokemon-list-loading">
        <div className="spinner"></div>
        <p>Loading Pokemon...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pokemon-list-error">
        <p>Error: {error}</p>
        <button onClick={() => fetchPokemon(currentPage)}>Retry</button>
      </div>
    );
  }

  return (
    <div className="pokemon-list">
      <div className="pokemon-grid">
        {pokemon.map((p) => (
          <PokemonCard key={p.id} pokemon={p} onClick={() => onPokemonClick(p)} />
        ))}
      </div>
      <div className="pagination-controls">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 0 || loading}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="pagination-info">Page {currentPage + 1}</span>
        <button
          onClick={handleNext}
          disabled={!hasMore || loading}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};