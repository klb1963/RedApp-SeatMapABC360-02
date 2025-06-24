// file: /code/components/seatMap/internal/Seatmap.tsx

import SeatTooltip from './SeatTooltip';
import { getColorByType, SeatType } from '../../../utils/parseSeatMapResponse';
import { getTooltipPosition } from '../helpers/getTooltipPosition';

import * as React from 'react';

export interface Seat {
  id: string;
  number?: string;
  isReserved?: boolean;
  tooltip?: string;
  seatCharacteristics?: string[];
  type: SeatType;
}

export interface Row {
  rowNumber: number;
  seats: Seat[];
  isExitRow?: boolean;
  isOverwingRow?: boolean;
  isBulkheadRow?: boolean; 
  deckId?: string;
}

interface SeatmapProps {
  rows: Row[];
  selectedSeatId?: string;
  onSeatClick: (seatId: string) => void;
  layoutLength: number;
}

const Seatmap: React.FC<SeatmapProps> = ({ rows, selectedSeatId, onSeatClick, layoutLength }) => {

  const [hoveredSeatId, setHoveredSeatId] = React.useState<string | null>(null);

  const overwingRowIndexes = rows
    .map((row, index) => (row.isOverwingRow ? index : -1))
    .filter(index => index !== -1);

  const firstOverwingIndex = overwingRowIndexes[0];
  const lastOverwingIndex = overwingRowIndexes[overwingRowIndexes.length - 1];

  const DiagonalIconLeft = () => (
    <svg width="24" height="24" viewBox="0 0 16 16">
      <line x1="0" y1="16" x2="16" y2="0" stroke="#848484" strokeWidth="2" />
    </svg>
  );
  const DiagonalIconRight = () => (
    <svg width="24" height="24" viewBox="0 0 16 16">
      <line x1="0" y1="0" x2="16" y2="16" stroke="#848484" strokeWidth="2" />
    </svg>
  );
  const Line = () => (
    <svg width="24" height="6" viewBox="0 0 20 6">
      <line x1="0" y1="3" x2="20" y2="3" stroke="#848484" strokeWidth="3" />
    </svg>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
        {rows.map((row, rowIndex) => (
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
              <div
                style={{
                  width: '4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {row.isExitRow && (
                  <span style={{ color: 'red', fontWeight: 'bold', fontSize: '2rem' }}>{'<<'}</span>
                )}

                {/* <div style={{ width: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {row.isBulkheadRow && (
                    <span style={{ color: '#4285f4', fontWeight: 'bold', fontSize: '1.4rem' }}>Bulkhead</span>
                  )}
                </div> */}

                {row.isOverwingRow && rowIndex === firstOverwingIndex && <DiagonalIconLeft />}
                {row.isOverwingRow && rowIndex === lastOverwingIndex && <Line />}
              </div>

              {/* 🪑 Сами кресла */}
              <div
                style={{
                  display: 'flex',
                  minHeight: '4rem',
                  minWidth: `${layoutLength * 4.5}rem`,
                  justifyContent: 'center',
                }}
              >
                {row.seats.map((seat, seatIndex) => {
                  const isSelected = seat.id === selectedSeatId;
                  const isAisle = seat.id.startsWith('AISLE');
                  const isPlaceholder = seat.id.startsWith('EMPTY');
                  const isLast = seatIndex === row.seats.length - 1;
                  const nextIsAisle = row.seats[seatIndex + 1]?.id.startsWith('AISLE');

                  const backgroundColor = getColorByType(seat.type || 'available');

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

                    <div key={seat.id} style={{ position: 'relative' }}>
                      {isAisle ? (
                        <div style={{ width: '2rem' }} />
                      ) : (
                        <>
                          <button
                            onClick={() => !seat.isReserved && onSeatClick(seat.id)}
                            disabled={seat.isReserved}
                            style={buttonStyle}
                            onMouseEnter={() => setHoveredSeatId(seat.id)}
                            onMouseLeave={() => setHoveredSeatId(null)}
                          >
                            {isPlaceholder ? ' ' : `${row.rowNumber}${seat.number || ''}`}
                          </button>
                            {/* 📌 Теперь тултип рендерится всегда при наведении */}
                            {hoveredSeatId === seat.id && seat.tooltip && (
                              <SeatTooltip
                                seatInfo={{
                                  rowNumber: row.rowNumber.toString(),
                                  column: seat.number || '',
                                  cabinClass: seat.tooltip?.split('\n')[0] || 'Economy', // например: "Economy"
                                  price: seat.tooltip?.split('\n')[1] || '',             // например: "Price: 90.20"
                                  characteristicsText: seat.tooltip
                                    ?.split('\n')
                                    .slice(2)
                                    .join('\n') || '',                                   // флаги и т.д.
                                }}
                                position={getTooltipPosition(rowIndex)}
                              />
                            )}
                        </>
                      )}
                    </div>

                  );
                })}
              </div>

              {/* Exit / Overwing справа */}
              <div
                style={{
                  width: '4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {row.isExitRow && (
                  <span style={{ color: 'red', fontWeight: 'bold', fontSize: '2rem' }}>{'>>'}</span>
                )}
                {row.isOverwingRow && rowIndex === firstOverwingIndex && <DiagonalIconRight />}
                {row.isOverwingRow && rowIndex === lastOverwingIndex && <Line />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Seatmap;