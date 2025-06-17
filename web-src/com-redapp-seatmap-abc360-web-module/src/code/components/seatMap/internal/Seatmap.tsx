// file: /code/components/seatMap/internal/Seatmap.tsx

import * as React from 'react';

export interface Seat {
  id: string;
  number?: string;
  isReserved?: boolean;
  tooltip?: string;
}

export interface Row {
  rowNumber: number;
  seats: Seat[];
}

interface SeatmapProps {
  rows: Row[];
  selectedSeatId?: string;
  onSeatClick: (seatId: string) => void;
}

const Seatmap: React.FC<SeatmapProps> = ({ rows, selectedSeatId, onSeatClick }) => {
  return (
    <div>
      {rows.map((row) => (
        <div key={row.rowNumber} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ width: '2rem', fontWeight: 'bold' }}>{row.rowNumber}</div>
          <div>
            {row.seats.map((seat) => {
              const isSelected = seat.id === selectedSeatId;
              return (
                <button
                  key={seat.id}
                  title={seat.tooltip}
                  onClick={() => !seat.isReserved && onSeatClick(seat.id)}
                  disabled={seat.isReserved}
                  style={{
                    margin: '2px',
                    padding: '0.5rem',
                    backgroundColor: seat.isReserved
                      ? '#ccc'
                      : isSelected
                      ? '#4caf50'
                      : '#f0f0f0',
                    border: '1px solid #999',
                    cursor: seat.isReserved ? 'not-allowed' : 'pointer',
                    minWidth: '2rem',
                  }}
                >
                  {seat.number || seat.id}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Seatmap;