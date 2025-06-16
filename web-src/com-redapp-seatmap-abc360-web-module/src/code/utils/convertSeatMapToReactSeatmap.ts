// ✅ file: /code/utils/convertSeatMapToReactSeatmap.ts

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

import { SeatInfo } from '../components/seatMap/types/SeatInfo';

/**
 * Преобразует массив SeatInfo[] из EnhancedSeatMapRQ в формат, понятный react-seatmap
 */
export function convertSeatMapToReactSeatmapFormat(seats: SeatInfo[]): ReactSeatRow[] {
  // ❗ Ключи объекта в JS всегда строки, поэтому здесь Record<string, ...>
  const rowsMap: Record<string, ReactSeat[]> = {};

  for (const seat of seats) {
    const rowMatch = seat.seatNumber.match(/^(\d+)([A-Z])$/);
    if (!rowMatch) continue;

    const rowKey = rowMatch[1]; // строка, например '11'
    const column = rowMatch[2]; // буква, например 'F'
    const isReserved = ['occupied', 'blocked', 'unavailable'].includes(
      seat.seatStatus.toLowerCase()
    );

    if (!rowsMap[rowKey]) {
      rowsMap[rowKey] = [];
    }

    rowsMap[rowKey].push({
      id: seat.seatNumber,
      number: column,
      isReserved,
      tooltip: seat.seatPrice ? `€${seat.seatPrice.toFixed(2)}` : undefined,
    });
  }

  // 🎯 Преобразуем rowsMap → массив ReactSeatRow[]
  return Object.entries(rowsMap)
    .map(([rowKey, seats]) => ({
      rowNumber: parseInt(rowKey, 10),
      seats: seats.sort((a, b) => a.number!.localeCompare(b.number!)),
    }))
    .sort((a, b) => a.rowNumber - b.rowNumber);
}