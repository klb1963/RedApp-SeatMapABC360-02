// file: /code/components/seatMap/internal/Seatmap.tsx

import SeatTooltip from './SeatTooltip';
import { getColorByType, SeatType } from '../../../utils/parseSeatMapResponse';
import { getTooltipPosition } from '../helpers/getTooltipPosition';
import EconomySeatSvg from './EconomySeatSvg';
import PremiumSeatSvg from './PremiumSeatSvg';

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

  // 🔁 Левая диагональ – "/"
  const DiagonalIconLeft = () => (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <line x1="0" y1="24" x2="24" y2="0" stroke="#848484" strokeWidth="2" />
    </svg>
  );

  // ✅ Правая диагональ – "\"
  const DiagonalIconRight = () => (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <line x1="0" y1="0" x2="24" y2="24" stroke="#848484" strokeWidth="2" />
    </svg>
  );

  // 🔄 Горизонтальная линия по центру
  const Line = () => (
    <svg width="24" height="6" viewBox="0 0 24 6">
      <line x1="0" y1="3" x2="24" y2="3" stroke="#848484" strokeWidth="3" />
    </svg>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
        {rows.map((row, rowIndex) => {
          const firstSeat = row.seats.find(s => !s.id.startsWith('AISLE') && !s.id.startsWith('EMPTY'));
          const cabinClass = firstSeat?.tooltip?.split('\n')[0]?.toLowerCase() || '';
          const isEconomy = cabinClass.includes('economy');

          const rowMarginBottom = isEconomy ? '-1.75rem' : '-2.75rem';
          const seatMinHeight = isEconomy ? '4rem' : '6rem';
          const overwingIconOffset = isEconomy ? '0rem' : '0.6rem';

          return (
            <div
              key={row.rowNumber}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                marginBottom: rowMarginBottom,
                fontFamily: 'sans-serif',
                marginLeft: row.seats.length < layoutLength ? '4rem' : 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '0rem',
                    top: overwingIconOffset,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    width: '3rem',
                  }}
                >
                  {/* Exit - left */}
                  {row.isExitRow && (
                    <span
                      style={{
                        color: 'red',
                        fontWeight: 'bold',
                        fontSize: '2rem',
                        position: 'relative',
                        top: isEconomy ? '3rem' : '1.5rem', // 👈 регулируем вертикальное положение
                        left: isEconomy ? '-4rem' : undefined, // 👈 регулируем положение по горизонтали
                      }}
                    >
                      {/* << */}
                      <svg
                        version="1.0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24" // или нужный размер
                        height="24"
                        viewBox="0 0 114 114"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <g transform="translate(0,114) scale(0.1,-0.1)" fill="red" stroke="none">
                          <path d="M635 922 c-115 -85 -269 -198 -341 -251 l-132 -96 344 -252 344 -252 0 129 0 129 95 -54 95 -54 0 354 0 354 -95 -54 -94 -53 -3 127 -3 127 -210 -154z" />
                        </g>
                      </svg>

                    </span>
                  )}

                  {/* Wing - left */}
                  {row.isOverwingRow && rowIndex === firstOverwingIndex && (
                    <div
                      style={{
                        position: 'relative',
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        left: isEconomy ? '-3rem' : '-3.5rem',
                        top: isEconomy ? '2rem' : '0rem',
                      }}
                    >
                      <DiagonalIconLeft />
                    </div>
                  )}

                  {row.isOverwingRow && rowIndex === lastOverwingIndex && (
                    <div
                      style={{
                        position: 'relative',
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        left: isEconomy ? '-4rem' : '-4rem',
                        top: isEconomy ? '5rem' : '3rem',
                      }}
                    >
                      <Line />
                    </div>
                  )}
                </div>

                {/* Seats */}
                <div
                  style={{
                    display: 'flex',
                    minHeight: seatMinHeight,
                    width: `auto`,
                    justifyContent: 'center',
                  }}
                >
                  {row.seats.map((seat, seatIndex) => {
                    const isAisle = seat.id.startsWith('AISLE');
                    const backgroundColor = getColorByType(seat.type || 'available');

                    // по умолчанию считаем все кресла экономом, кроме тех, где явно указан бизнес или премиум
                    const tooltipClass = seat.tooltip?.split('\n')[0]?.toLowerCase() || '';
                    const isPremium = tooltipClass.includes('business') || tooltipClass.includes('premium');
                    const SeatIcon = isPremium ? PremiumSeatSvg : EconomySeatSvg;

                    return (
                      <div key={seat.id} style={{ position: 'relative' }}>
                        {isAisle ? (
                          <div style={{ width: '2rem' }} />
                        ) : (
                          <>
                            <div
                              onMouseEnter={() => setHoveredSeatId(seat.id)}
                              onMouseLeave={() => setHoveredSeatId(null)}
                            >
                              <SeatIcon
                                color={backgroundColor}
                                onClick={() => !seat.isReserved && onSeatClick(seat.id)}
                                label={`${row.rowNumber}${seat.number || ''}`}
                              />
                            </div>

                            {hoveredSeatId === seat.id && seat.tooltip && (
                              <SeatTooltip
                                seatInfo={{
                                  rowNumber: row.rowNumber.toString(),
                                  column: seat.number || '',
                                  cabinClass: seat.tooltip?.split('\n')[0] || 'Economy',
                                  price: seat.tooltip?.split('\n')[1] || '',
                                  characteristicsText: seat.tooltip
                                    ?.split('\n')
                                    .slice(2)
                                    .join('\n') || '',
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

                <div
                  style={{
                    position: 'absolute',
                    right: '0rem',
                    top: overwingIconOffset,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    width: '3rem',
                  }}
                >

                  {/* Exit - right */}
                  {row.isExitRow && (
                    <span
                      style={{
                        color: 'red',
                        fontWeight: 'bold',
                        fontSize: '2rem',
                        position: 'relative',
                        top: isEconomy ? '3rem' : '1.5rem',
                        left: isEconomy ? '4rem' : undefined, // 👈 регулируем положение по горизонтали
                      }}
                    >
                      {/* {'>>'} */}
                      <svg
                        version="1.0"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 114 114"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <g transform="translate(114,0) scale(-0.1,0.1)" fill="red" stroke="none">
                          <path d="M635 922 c-115 -85 -269 -198 -341 -251 l-132 -96 344 -252 344 -252 0 129 0 129 95 -54 95 -54 0 354 0 354 -95 -54 -94 -53 -3 127 -3 127 -210 -154z" />
                        </g>
                      </svg>
                    </span>
                  )}

                  {/* Wing - right */}
                  {row.isOverwingRow && rowIndex === firstOverwingIndex && (
                    <div
                      style={{
                        position: 'relative',
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        left: isEconomy ? '3rem' : '3rem',
                        top: isEconomy ? '2rem' : '0rem',
                      }}
                    >
                      <DiagonalIconRight/>
                    </div>
                  )}

                  {row.isOverwingRow && rowIndex === lastOverwingIndex && (
                    <div
                      style={{
                        position: 'relative',
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        left: isEconomy ? '4rem' : '3rem',
                        top: isEconomy ? '5rem' : '3rem',
                      }}
                    >
                      <Line />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Seatmap;