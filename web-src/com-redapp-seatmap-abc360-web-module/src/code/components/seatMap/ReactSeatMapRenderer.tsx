// file: /code/components/seatMap/ReactSeatMapRender.tsx

import * as React from 'react';
import Seatmap from './internal/Seatmap'; 

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
