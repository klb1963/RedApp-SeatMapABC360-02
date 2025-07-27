// ✅ file: /code/components/seatMap/fallback-seat-map/DeckSelector.tsx

import * as React from 'react';
import { t } from '../../../Context'; // ✅ твой i18n механизм

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
          {/* Down arrow */}

          {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <rect x="1" y="1" width="22" height="22" rx="2" fill="white" stroke="#234E55" strokeWidth="2" />
            <polygon points="6,10 12,16 18,10" fill="none" stroke="#234E55" strokeWidth="2" strokeLinejoin="round" />
          </svg> */}

          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
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
              d="M6 10 L12 16 L18 10 Z"
              fill="none"
              stroke="#234E55"
              strokeWidth="2"
              strokeLinejoin="round"
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
          {/* Up arrow - checked */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <rect x="1" y="1" width="22" height="22" rx="2" fill="white" stroke="#234E55" strokeWidth="2" />
            <path d="M6 14 L12 8 L18 14 Z" fill="none" stroke="#234E55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

        </button>
      )}

      {/* <span style={{ fontWeight: 'normal', fontSize: '1.8rem', color: '#234E55' }}>
        {selectedDeck === 'Upperdeck' ? t('seatMap.legend.deck1') : t('seatMap.legend.deck2')}
      </span> */}

      <span style={{ fontWeight: 'normal', fontSize: '1.8rem', color: '#234E55' }}>
        {selectedDeck}
      </span>

    </div>
  );
};

export default DeckSelector;