import type { BoxEntry, Pokemon } from '../types/types';
import '../styles/BoxCard.css';

interface BoxCardProps {
  entry: BoxEntry;
  pokemon: Pokemon;
  onEdit: (entry: BoxEntry) => void;
  onDelete: (id: string) => void;
}

export const BoxCard = ({ entry, pokemon, onEdit, onDelete }: BoxCardProps) => {
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${pokemon.name}?`)) {
      onDelete(entry.id);
    }
  };

  return (
    <div className="box-card">
      <div className="box-card-header">
        <img src={pokemon.sprites.front_default} alt={pokemon.name} />
        <div className="box-card-title">
          <h3>{pokemon.name}</h3>
          <div className="box-card-types">
            {pokemon.types.map((type) => (
              <span
                key={type.name}
                className="type-badge-small"
                style={{ backgroundColor: type.color }}
              >
                {type.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="box-card-info">
        <div className="info-item">
          <span className="info-label">Location:</span>
          <span className="info-value">{entry.location}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Level:</span>
          <span className="info-value">{entry.level}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Caught:</span>
          <span className="info-value">{formatDate(entry.createdAt)}</span>
        </div>
        {entry.notes && (
          <div className="info-item notes">
            <span className="info-label">Notes:</span>
            <span className="info-value">{entry.notes}</span>
          </div>
        )}
      </div>

      <div className="box-card-actions">
        <button className="edit-button" onClick={() => onEdit(entry)}>
          Edit
        </button>
        <button className="delete-button" onClick={handleDelete}>
          Release
        </button>
      </div>
    </div>
  );
};
