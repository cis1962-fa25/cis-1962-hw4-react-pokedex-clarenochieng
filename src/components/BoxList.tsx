import { useState, useEffect } from 'react';
import type { BoxEntry, Pokemon } from '../types/types';
import { BoxCard } from './BoxCard';
import { BoxForm } from './BoxForm';
import { PokemonAPI } from '../api/PokemonAPI';
import '../styles/BoxList.css';

interface BoxListProps {
  api: PokemonAPI;
  pokemonIdToName: Map<number, string>;
}

export const BoxList = ({ api, pokemonIdToName }: BoxListProps) => {
  const [entries, setEntries] = useState<BoxEntry[]>([]);
  const [entryPokemon, setEntryPokemon] = useState<Map<string, Pokemon>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<BoxEntry | null>(null);
  const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);

  const fetchBoxEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = api.getToken();
      if (!token) throw new Error('JWT token is not set');

      const entryIds = await api.listBoxEntryIds();
      
      if (entryIds.length === 0) {
        setEntries([]);
        setEntryPokemon(new Map());
        setLoading(false);
        return;
      }

      const entryPromises = entryIds.map((id) => api.getBoxEntry(id));
      const fetchedEntries = await Promise.all(entryPromises);
      setEntries(fetchedEntries);

      const pokemonPromises = fetchedEntries.map(async (entry) => {
        const pokemonName = pokemonIdToName.get(entry.pokemonId);
        if (!pokemonName) return null;
        try {
          const pokemon = await api.getPokemonByName(pokemonName);
          return { entryId: entry.id, pokemon };
        } catch {
          return null;
        }
      });

      const pokemonResults = await Promise.all(pokemonPromises);
      const pokemonMap = new Map<string, Pokemon>();
      pokemonResults.forEach((result) => {
        if (result) pokemonMap.set(result.entryId, result.pokemon);
      });
      setEntryPokemon(pokemonMap);
    } catch (err) {
      let errorMessage = 'Failed to fetch Box entries';
      if (err instanceof Error) {
        const status = (err as Error & { status?: number }).status;
        errorMessage = err.message;
        if (status === 401) errorMessage = `Unauthorized: ${err.message}. Please double check your token.`;
        else if (status === 403) errorMessage = `Forbidden: ${err.message}.`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxEntries();
  }, []);

  const handleEdit = (entry: BoxEntry) => {
    const pokemon = entryPokemon.get(entry.id);
    if (pokemon) {
      setEditingEntry(entry);
      setEditingPokemon(pokemon);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBoxEntry(id);
      await fetchBoxEntries();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entry';
      alert(errorMessage);
    }
  };

  const handleEditSuccess = () => {
    setEditingEntry(null);
    setEditingPokemon(null);
    fetchBoxEntries();
  };

  if (error) {
    return (
      <div className="box-list-error">
        <h3>Error Loading Box</h3>
        <p>{error}</p>
        <button onClick={fetchBoxEntries}>Retry</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="box-list-loading">
        <div className="spinner"></div>
        <p>Loading your Box...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="box-list-empty">
        <p>Your Box is empty!</p>
        <p>Add Pokemon to your Box.</p>
      </div>
    );
  }

  return (
    <>
      <div className="box-list">
        <div className="box-grid">
          {entries.map((entry) => {
            const pokemon = entryPokemon.get(entry.id);
            if (!pokemon) return <div key={entry.id} className="box-card-loading">Loading...</div>;
            return (
              <BoxCard
                key={entry.id}
                entry={entry}
                pokemon={pokemon}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      </div>

      {editingEntry && editingPokemon && (
        <BoxForm
          pokemon={editingPokemon}
          api={api}
          isOpen={true}
          onClose={() => {
            setEditingEntry(null);
            setEditingPokemon(null);
          }}
          onSuccess={handleEditSuccess}
          entry={editingEntry}
        />
      )}
    </>
  );
};
