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
        <div
          key={row.rowNumber}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ width: '2rem', fontWeight: 'bold' }}>{row.rowNumber}</div>
          <div style={{ display: 'flex' }}>
            {row.seats.map((seat, seatIndex) => {
              const isSelected = seat.id === selectedSeatId;
              const isAisle = seat.id.startsWith('AISLE');
              const isLast = seatIndex === row.seats.length - 1;
              const nextIsAisle = row.seats[seatIndex + 1]?.id.startsWith('AISLE');

              const backgroundColor = (() => {
                if (seat.isReserved && !seat.tooltip) return '#ccc'; // Unavailable
                if (!seat.isReserved && !seat.tooltip) return '#4caf50'; // Available
                if (seat.tooltip?.toUpperCase().includes('PREFERRED')) return '#26c6da'; // Preferred paid
                if (seat.tooltip?.includes('€')) return '#fdd835'; // Paid seat
                return '#f0f0f0';
              })();

              const buttonStyle: React.CSSProperties = {
                width: '6rem',
                height: '6rem',
                backgroundColor,
                border: 'none',
                borderRadius: '0.75rem',
                color: '#000',
                fontWeight: 'bold',
                cursor: seat.isReserved ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'background-color 0.2s',
                marginRight: nextIsAisle || isLast ? 0 : '0.4rem',
              };

              return (
                <div key={seat.id}>
                  {isAisle ? (
                    <div style={{ width: '3rem' }} />
                  ) : (
                    <button
                      title={seat.tooltip}
                      onClick={() => !seat.isReserved && onSeatClick(seat.id)}
                      disabled={seat.isReserved}
                      style={buttonStyle}
                    >
                      {seat.number || ''}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Seatmap;