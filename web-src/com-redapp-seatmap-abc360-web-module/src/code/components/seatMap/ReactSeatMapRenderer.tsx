import * as React from 'react';
import Seatmap from 'react-seatmap';
import { convertSeatMapToReactSeatmapFormat, ReactSeatRow } from '../../utils/convertSeatMapToReactSeatmap';

export const ReactSeatMapRenderer: React.FC<{
  rows: any[];
  selectedSeatId: string | null;
  onSeatSelect: (seatId: string) => void;
}> = ({ rows, selectedSeatId, onSeatSelect }) => {
  return (
    <div>
      <Seatmap
        rows={rows}
        selectedSeatId={selectedSeatId}
        onSeatClick={onSeatSelect}
      />
    </div>
  );
};
