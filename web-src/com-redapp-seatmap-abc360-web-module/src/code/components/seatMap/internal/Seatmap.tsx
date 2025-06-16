import * as React from 'react';
import './seatmap.css';

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
    <div className="seatmap">
      {rows.map((row) => (
        <div className="row" key={row.rowNumber}>
          <div className="row-number">{row.rowNumber}</div>
          <div className="seats">
            {row.seats.map((seat) => {
              const isSelected = seat.id === selectedSeatId;
              const className = [
                'seat',
                seat.isReserved ? 'reserved' : '',
                isSelected ? 'selected' : ''
              ].join(' ');

              return (
                <button
                  key={seat.id}
                  className={className}
                  title={seat.tooltip}
                  onClick={() => !seat.isReserved && onSeatClick(seat.id)}
                  disabled={seat.isReserved}
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