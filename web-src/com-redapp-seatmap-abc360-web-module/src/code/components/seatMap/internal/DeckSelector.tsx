// ✅ file: /code/components/seatMap/internal/DeckSelector.tsx

import * as React from 'react';

interface DeckSelectorProps {
  decks: string[];
  selectedDeck: string;
  onChange: (deck: string) => void;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ decks, selectedDeck, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      {decks.map((deck) => (
        <button
          key={deck}
          onClick={() => onChange(deck)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: deck === selectedDeck ? '#1976d2' : '#e0e0e0',
            color: deck === selectedDeck ? 'white' : 'black',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {deck}
        </button>
      ))}
    </div>
  );
};

export default DeckSelector;