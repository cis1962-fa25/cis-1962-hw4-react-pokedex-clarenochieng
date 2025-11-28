import { useState, useEffect } from 'react';
import type React from 'react';
import type { Pokemon, BoxEntry, InsertBoxEntry, UpdateBoxEntry } from '../types/types';
import { Modal } from './Modal';
import { PokemonAPI } from '../api/PokemonAPI';
import '../styles/BoxForm.css';

interface BoxFormProps {
  pokemon: Pokemon;
  api: PokemonAPI;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entry?: BoxEntry;
}

export const BoxForm = ({
  pokemon,
  api,
  isOpen,
  onClose,
  onSuccess,
  entry,
}: BoxFormProps) => {
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!entry;

  useEffect(() => {
    if (entry) {
      setLocation(entry.location);
      setLevel(entry.level.toString());
      setNotes(entry.notes || '');
      setCreatedAt(entry.createdAt);
    } else {
      setLocation('');
      setLevel('');
      setNotes('');
      setCreatedAt(new Date().toISOString());
    }
    setError(null);
  }, [entry, isOpen]);

  const validateForm = (): boolean => {
    if (!location.trim()) {
      setError('Location is required');
      return false;
    }

    const levelNum = parseInt(level, 10);
    if (isNaN(levelNum) || levelNum < 1 || levelNum > 100) {
      setError('Level must be a number between 1 and 100');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isEditing && entry) {
        const updateData: UpdateBoxEntry = {
          location: location.trim(),
          level: parseInt(level, 10),
          notes: notes.trim() || undefined,
          createdAt,
        };
        await api.updateBoxEntry(entry.id, updateData);
      } else {
        const insertData: InsertBoxEntry = {
          pokemonId: pokemon.id,
          location: location.trim(),
          level: parseInt(level, 10),
          notes: notes.trim() || undefined,
          createdAt,
        };
        await api.createBoxEntry(insertData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save Box entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Box Entry' : `Catch ${pokemon.name}`}
    >
      <form onSubmit={handleSubmit} className="box-form">
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Route 1, Viridian Forest"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="level">Level *</label>
          <input
            id="level"
            type="number"
            min="1"
            max="100"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            placeholder="1-100"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="createdAt">Catch Date</label>
          <input
            id="createdAt"
            type="datetime-local"
            value={createdAt.slice(0, 16)}
            onChange={(e) => {
              const date = new Date(e.target.value);
              setCreatedAt(date.toISOString());
            }}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this catch..."
            rows={4}
            disabled={loading}
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading} className="cancel-button">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Saving...' : isEditing ? 'Update' : 'Catch'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
