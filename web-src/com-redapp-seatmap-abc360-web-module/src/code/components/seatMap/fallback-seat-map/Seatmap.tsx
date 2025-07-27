// file: /code/components/seatMap/fallback-seat-map/Seatmap.tsx

/**
 * Seatmap.tsx
 *
 * 🎫 Main component for rendering a fallback aircraft seat map.
 *
 * Responsibilities:
 * - Renders all seat rows, aisles, exits, overwing rows, decks (via deckId)
 * - Displays seats with custom SVG icons and styles based on class/cabin
 * - Shows passenger initials for selected seats
 * - Handles hover tooltips with seat details (cabin, price, characteristics)
 * - Adds overwing visual markers and exit arrows per row configuration
 *
 * This is a standalone visual component used when quicket.io map is unavailable,
 * such as fallback or dev environments.
 */

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
  hidden?: boolean;
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
  selectedSeatsMap?: Record<string, { passengerInitials: string; passengerColor?: string }>;
}

const Seatmap: React.FC<SeatmapProps> = ({
  rows,
  selectedSeatId,
  onSeatClick,
  layoutLength,
  selectedSeatsMap = {}
}) => {
  const [hoveredSeatId, setHoveredSeatId] = React.useState<string | null>(null);

  // Collect indexes of overwing rows to show markers only for first & last
  const overwingRowIndexes = rows
    .map((row, index) => (row.isOverwingRow ? index : -1))
    .filter(index => index !== -1);

  const firstOverwingIndex = overwingRowIndexes[0];
  const lastOverwingIndex = overwingRowIndexes[overwingRowIndexes.length - 1];

  // Simple SVG line icons for overwing markers
  const DiagonalIconLeft = () => (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <line x1="0" y1="24" x2="24" y2="0" stroke="#848484" strokeWidth="4" />
    </svg>
  );

  const DiagonalIconRight = () => (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <line x1="0" y1="0" x2="24" y2="24" stroke="#848484" strokeWidth="4" />
    </svg>
  );

  const Line = () => (
    <svg width="24" height="6" viewBox="0 0 24 6">
      <line x1="0" y1="3" x2="24" y2="3" stroke="#848484" strokeWidth="4" />
    </svg>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          backgroundColor: '#1E3C5A',
          padding: '5px',
          paddingBottom: '4rem',
          borderRadius: '8px',
          display: 'inline-block',
          boxShadow: '0 0 6px rgba(0, 0, 0, 0.4)',
        }}
      >
        {rows.map((row, rowIndex) => {
          // Use tooltip to infer cabin class
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {/* === Left side markers === */}
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
                  {/* EXIT icon (left) */}
                  {row.isExitRow && (
                    <span
                      style={{
                        color: 'red',
                        fontWeight: 'bold',
                        fontSize: '2rem',
                        position: 'relative',
                        top: isEconomy ? '3rem' : '1.5rem',
                        left: isEconomy ? '-4rem' : undefined,
                      }}
                    >
                      <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 114 114" preserveAspectRatio="xMidYMid meet">
                        <g transform="translate(0,114) scale(0.1,-0.1)" fill="red" stroke="none">
                          <path d="M635 922 c-115 -85 -269 -198 -341 -251 l-132 -96 344 -252 344 -252 0 129 0 129 95 -54 95 -54 0 354 0 354 -95 -54 -94 -53 -3 127 -3 127 -210 -154z" />
                        </g>
                      </svg>
                    </span>
                  )}

                  {/* Overwing start marker */}
                  {row.isOverwingRow && rowIndex === firstOverwingIndex && (
                    <div
                      style={{
                        position: 'relative',
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        left: '-3.5rem',
                        top: isEconomy ? '3rem' : '0rem',
                      }}
                    >
                      <DiagonalIconLeft />
                    </div>
                  )}

                  {/* Overwing end marker */}
                  {row.isOverwingRow && rowIndex === lastOverwingIndex && (
                    <div
                      style={{
                        position: 'relative',
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        left: '-4rem',
                        top: isEconomy ? '5rem' : '3rem',
                      }}
                    >
                      <Line />
                    </div>
                  )}
                </div>

                {/* === Main seat content (row of seats) === */}
                <div
                  style={{
                    display: 'flex',
                    minHeight: seatMinHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {row.seats.map((seat) => {
                    const isAisle = seat.id.startsWith('AISLE');
                    const backgroundColor = getColorByType(seat.type || 'available');

                    const tooltipClass = seat.tooltip?.split('\n')[0]?.toLowerCase() || '';
                    const isPremium = tooltipClass.includes('business') || tooltipClass.includes('premium');
                    const SeatIcon = isPremium ? PremiumSeatSvg : EconomySeatSvg;

                    const passenger = selectedSeatsMap[seat.id];

                    return (
                      <div
                        key={seat.id}
                        style={{
                          position: 'relative',
                          width: isAisle ? '2rem' : isPremium ? '3.5rem' : '3rem',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {/* Empty seat box (ghost) */}
                        {seat.hidden ? (
                          <div
                            style={{
                              width: '3rem',
                              height: '3rem',
                              backgroundColor: '#1E3C5A',
                              opacity: 0.5,
                            }}
                          />
                        ) : isAisle ? null : (
                          <>
                            {/* Clickable seat with optional initials */}
                            <div
                              onMouseEnter={() => setHoveredSeatId(seat.id)}
                              onMouseLeave={() => setHoveredSeatId(null)}
                            >
                              <SeatIcon
                                color={backgroundColor}
                                label={`${row.rowNumber}${seat.number || ''}`}
                                onClick={() => {
                                  if (seat.isReserved || !seat.id) return;
                                  onSeatClick(seat.id);
                                }}
                              />
                              {passenger && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: isEconomy ? '50%' : '30%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: passenger.passengerColor || 'white',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '3rem',
                                    height: '3rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 0 3px rgba(0,0,0,0.4)'
                                  }}
                                >
                                  {passenger.passengerInitials}
                                </div>
                              )}
                            </div>

                            {/* Tooltip on hover */}
                            {hoveredSeatId === seat.id && seat.tooltip && (
                              <SeatTooltip
                                seatInfo={{
                                  rowNumber: row.rowNumber.toString(),
                                  column: seat.number || '',
                                  cabinClass: seat.tooltip?.split('\n')[0] || 'Economy',
                                  price: seat.tooltip?.split('\n')[1] || '',
                                  characteristicsText: seat.tooltip?.split('\n').slice(2).join('\n') || '',
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

                {/* === Right side markers === */}
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
                  {/* EXIT icon (right) */}
                  {row.isExitRow && (
                    <span
                      style={{
                        color: 'red',
                        fontWeight: 'bold',
                        fontSize: '2rem',
                        position: 'relative',
                        top: isEconomy ? '3rem' : '1.5rem',
                        left: isEconomy ? '4rem' : undefined,
                      }}
                    >
                      <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 114 114" preserveAspectRatio="xMidYMid meet">
                        <g transform="translate(114,0) scale(-0.1,0.1)" fill="red" stroke="none">
                          <path d="M635 922 c-115 -85 -269 -198 -341 -251 l-132 -96 344 -252 344 -252 0 129 0 129 95 -54 95 -54 0 354 0 354 -95 -54 -94 -53 -3 127 -3 127 -210 -154z" />
                        </g>
                      </svg>
                    </span>
                  )}

                  {/* Overwing start marker */}
                  {row.isOverwingRow && rowIndex === firstOverwingIndex && (
                    <div
                      style={{
                        position: 'relative',
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        left: '3.5rem',
                        top: isEconomy ? '3rem' : '0rem',
                      }}
                    >
                      <DiagonalIconRight />
                    </div>
                  )}

                  {/* Overwing end marker */}
                  {row.isOverwingRow && rowIndex === lastOverwingIndex && (
                    <div
                      style={{
                        position: 'relative',
                        width: '3rem',
                        height: '3rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        left: '4rem',
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