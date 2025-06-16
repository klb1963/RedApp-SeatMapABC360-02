import * as React from 'react';
import Seatmap from 'react-seatmap';
import { convertSeatMapToReactSeatmapFormat, ReactSeatRow } from '../../utils/convertSeatMapToReactSeatmap';
import { SeatInfo } from '../../types/SeatInfo'; // если есть, иначе временно оставим как any

interface Props {
  seatInfo: SeatInfo[];
  selectedSeatId: string | null;
  onSeatSelect: (seatId: string) => void;
}

const ReactSeatMapRenderer: React.FC<Props> = ({ seatInfo, selectedSeatId, onSeatSelect }) => {
  const rows: ReactSeatRow[] = React.useMemo(() => convertSeatMapToReactSeatmapFormat(seatInfo), [seatInfo]);

  return (
    <div style={{ padding: '1rem' }}>
      <Seatmap
        rows={rows}
        selectedSeatId={selectedSeatId || undefined}
        onSeatClick={(seatId) => onSeatSelect(seatId)}
      />
    </div>
  );
};

export default ReactSeatMapRenderer;