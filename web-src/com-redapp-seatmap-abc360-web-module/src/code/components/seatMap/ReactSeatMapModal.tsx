// file: /code/components/seatMap/ReactSeatMapModal.tsx

import * as React from 'react';

export const ReactSeatMapModal: React.FC = () => {
    const [selectedSeatId, setSelectedSeatId] = React.useState<string | null>(null);
    const seatIds = ['1A', '1B', '1C'];
  
    return (
      <div style={{ padding: '2rem' }}>
        <h2>🧪 Тест: useState + map + onClick</h2>
        <div>
          {seatIds.map(id => (
            <button
              key={id}
              style={{
                margin: '0.5rem',
                padding: '1rem',
                backgroundColor: selectedSeatId === id ? 'green' : 'gray',
              }}
              onClick={() => setSelectedSeatId(id)}
            >
              {id}
            </button>
          ))}
        </div>
        {selectedSeatId && <p>🪑 Вы выбрали место: <strong>{selectedSeatId}</strong></p>}
      </div>
    );
  };