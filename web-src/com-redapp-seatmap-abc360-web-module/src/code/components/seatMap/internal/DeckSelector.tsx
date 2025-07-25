// ✅ file: /code/components/seatMap/internal/DeckSelector.tsx

import * as React from 'react';

interface DeckSelectorProps {
  decks: string[];
  selectedDeck: string;
  onChange: (deck: string) => void;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ decks, selectedDeck, onChange }) => {
  const currentIndex = decks.indexOf(selectedDeck);
  const hasNextDeck = currentIndex < decks.length - 1;
  const hasPrevDeck = currentIndex > 0;

  const nextDeck = hasNextDeck ? decks[currentIndex + 1] : null;
  const prevDeck = hasPrevDeck ? decks[currentIndex - 1] : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', gap: '1rem' }}>
      {hasPrevDeck && (
        <button
          onClick={() => onChange(prevDeck!)}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: '#234E55',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {/* Up */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <rect
              x="1"
              y="1"
              width="22"
              height="22"
              rx="2"
              fill="white"
              stroke="#234E55"
              strokeWidth="2"
            />
            <path
              d="M6 10L12 16L18 10Z"
              stroke="#234E55"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>

        </button>
      )}

      {hasNextDeck && (
        <button
          onClick={() => onChange(nextDeck!)}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: '#234E55',
            color: 'white',
            border: '1px solid white',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {/* Down */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <rect
              x="1"
              y="1"
              width="22"
              height="22"
              rx="2"
              fill="white"
              stroke="#234E55"
              strokeWidth="2"
            />
            <polygon
              points="6,14 12,8 18,14"
              fill="none"
              stroke="#234E55"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>

        </button>
      )}

      <span style={{ fontWeight: 'bold', fontSize: '2rem', color: '#234E55' }}>
        {selectedDeck === 'Upperdeck' ? 'Deck 1' : 'Deck 2'}
      </span>
    </div>
  );
};

export default DeckSelector;