// file: /code/components/seatMap/ReactSeatMapRender.tsx

import * as React from 'react';
import Seatmap from './internal/Seatmap';
import type { Row } from './internal/Seatmap'; 

export const ReactSeatMapRenderer: React.FC<{
  rows: any[];
  selectedSeatId: string | null;
  onSeatSelect: (seatId: string) => void;
  layoutLength: number;
}> = ({ rows, selectedSeatId, onSeatSelect, layoutLength }) => {
  return (
    <div>
      <Seatmap
        rows={rows}
        selectedSeatId={selectedSeatId}
        onSeatClick={onSeatSelect}
        layoutLength={layoutLength}
      />
    </div>
  );
};
