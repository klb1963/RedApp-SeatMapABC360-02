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
 * Преобразует массив SeatInfo[] из EnhancedSeatMapRQ в формат React Seatmap,
 * используя layoutLetters для вставки проходов
 */
export function convertSeatMapToReactSeatmapFormat(
  seats: SeatInfo[],
  layoutLetters: string[] // ← получено из parseSeatMapResponse
): ReactSeatRow[] {
  const rowsMap: Record<string, Record<string, SeatInfo>> = {};

  for (const seat of seats) {
    const match = seat.seatNumber.match(/^(\d+)([A-Z])$/);
    if (!match) continue;

    const rowNumber = match[1];
    const letter = match[2];
    if (!rowsMap[rowNumber]) rowsMap[rowNumber] = {};
    rowsMap[rowNumber][letter] = seat;
  }

  const result: ReactSeatRow[] = [];

  for (const [rowNumberStr, letterSeatMap] of Object.entries(rowsMap)) {
    const rowNumber = parseInt(rowNumberStr, 10);
    const rowSeats: ReactSeat[] = [];

    layoutLetters.forEach((col, idx) => {
      if (col === '|') {
        rowSeats.push({
          id: `AISLE-${rowNumber}-${idx}`,
          isReserved: true,
        });
      } else {
        const seat = letterSeatMap[col];
        if (!seat) return;

        const isReserved = ['occupied', 'blocked', 'unavailable'].includes(seat.seatStatus.toLowerCase());

        rowSeats.push({
          id: seat.seatNumber,
          number: col,
          isReserved,
          tooltip: [
            seat.seatCharacteristics?.includes('O') ? 'PREFERRED' : '',
            seat.seatPrice ? `€${seat.seatPrice.toFixed(2)}` : '',
          ].filter(Boolean).join(' ')
        });
      }
    });

    result.push({ rowNumber, seats: rowSeats });
  }

  return result.sort((a, b) => a.rowNumber - b.rowNumber);
}