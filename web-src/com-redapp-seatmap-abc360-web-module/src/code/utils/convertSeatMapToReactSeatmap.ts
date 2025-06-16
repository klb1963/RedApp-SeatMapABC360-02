// ✅ file: /code/utils/convertSeatMapToReactSeatmap.ts

import { SeatInfo } from '../components/seatMap/types/SeatInfo';

export interface ReactSeat {
  id: string;
  number?: string;
  isReserved?: boolean;
  tooltip?: string;
}

export interface ReactSeatRow {
  rowNumber: number;
  seats: ReactSeat[];
}

/**
 * Преобразует массив SeatInfo[] из EnhancedSeatMapRQ в формат, понятный react-seatmap
 */
export function convertSeatMapToReactSeatmapFormat(seats: SeatInfo[]): ReactSeatRow[] {
  const rowsMap: Record<string, ReactSeat[]> = {};

  for (const seat of seats) {
    const rowMatch = seat.seatNumber.match(/^(\d+)([A-Z])$/);
    if (!rowMatch) continue;

    const rowNumber = parseInt(rowMatch[1], 10);
    const column = rowMatch[2];
    const isReserved = seat.seatStatus?.toLowerCase() !== 'available';

    const seatData: ReactSeat = {
      id: seat.seatNumber,
      number: column,
      isReserved,
      tooltip: seat.seatPrice ? `€${seat.seatPrice.toFixed(2)}` : undefined,
    };

    if (!rowsMap[rowNumber]) {
      rowsMap[rowNumber] = [];
    }

    rowsMap[rowNumber].push(seatData);
  }

  // 🎯 Преобразуем rowsMap → массив ReactSeatRow[]
  return Object.entries(rowsMap)
    .map(([rowKey, seats]) => ({
      rowNumber: parseInt(rowKey, 10),
      seats: seats.sort((a, b) => a.number!.localeCompare(b.number!)),
    }))
    .sort((a, b) => a.rowNumber - b.rowNumber);
}