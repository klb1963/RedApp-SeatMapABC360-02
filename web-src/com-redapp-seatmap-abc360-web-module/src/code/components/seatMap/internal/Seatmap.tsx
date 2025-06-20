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
  isExitRow?: boolean;
  isOverwingRow?: boolean;
}

interface SeatmapProps {
  rows: Row[];
  selectedSeatId?: string;
  onSeatClick: (seatId: string) => void;
  layoutLength: number;
}

const Seatmap: React.FC<SeatmapProps> = ({ rows, selectedSeatId, onSeatClick, layoutLength }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
        {rows.map((row) => (
          <div
            key={row.rowNumber}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              fontFamily: 'sans-serif',
              marginLeft: row.seats.length < layoutLength ? '4rem' : 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>

              {/* Exit / Overwing слева */}
              <div style={{
                width: '4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {row.isExitRow && <span style={{ color: 'red', fontWeight: 'bold' }}>Exit</span>}
                {row.isOverwingRow && <span style={{ color: 'orange', fontWeight: 'bold' }}>W</span>}
              </div>

              {/* 🪑 Сами кресла */}
              <div style={{ display: 'flex' }}>
                {row.seats.map((seat, seatIndex) => {
                  const isSelected = seat.id === selectedSeatId;
                  const isAisle = seat.id.startsWith('AISLE');
                  const isPlaceholder = seat.id.startsWith('EMPTY');
                  const isLast = seatIndex === row.seats.length - 1;
                  const nextIsAisle = row.seats[seatIndex + 1]?.id.startsWith('AISLE');

                  const backgroundColor = (() => {
                    if (isPlaceholder) return '#fff';
                    if (seat.isReserved && !seat.tooltip) return '#ccc';
                    if (!seat.isReserved && !seat.tooltip) return '#4caf50';
                    if (seat.tooltip?.toUpperCase().includes('PREFERRED')) return '#26c6da';
                    if (seat.tooltip?.includes('€')) return '#fdd835';
                    return '#f0f0f0';
                  })();

                  const buttonStyle: React.CSSProperties = {
                    width: '4rem',
                    height: '4rem',
                    backgroundColor,
                    border: 'none',
                    borderRadius: '0.75rem 0.75rem 0 0',
                    color: isPlaceholder ? '#fff' : '#fff',
                    fontWeight: 'bold',
                    fontSize: '1.3rem',
                    cursor: seat.isReserved ? 'not-allowed' : 'pointer',
                    boxShadow: isPlaceholder ? 'none' : '0 1px 3px rgba(0,0,0,0.3)',
                    transition: 'background-color 0.2s',
                    marginRight: nextIsAisle || isLast ? 0 : '0.4rem',
                  };

                  return (
                    <div key={seat.id}>
                      {isAisle ? (
                        <div style={{ width: '2rem' }} />
                      ) : (
                        <button
                          title={seat.tooltip}
                          onClick={() => !seat.isReserved && onSeatClick(seat.id)}
                          disabled={seat.isReserved}
                          style={buttonStyle}
                        >
                          {isPlaceholder ? '' : `${row.rowNumber}${seat.number ?? ''}`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Exit / Overwing справа */}
              <div style={{
                width: '4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {row.isExitRow && <span style={{ color: 'red', fontWeight: 'bold' }}>Exit</span>}
                {row.isOverwingRow && <span style={{ color: 'orange', fontWeight: 'bold' }}>W</span>}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Seatmap;