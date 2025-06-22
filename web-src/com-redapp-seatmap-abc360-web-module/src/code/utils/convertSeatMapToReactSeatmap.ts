// file: /code/utils/convertSeatMapToReactSeatmap.ts

import { SeatInfo } from '../components/seatMap/types/SeatInfo';

export interface ReactSeat {
  id: string;
  number?: string;
  isReserved?: boolean;
  tooltip?: string;
  seatCharacteristics?: string[];
}

export interface ReactSeatRow {
  rowNumber: number;
  seats: ReactSeat[];
  isExitRow?: boolean;
  isOverwingRow?: boolean;
  deckId?: string;
}

export interface ReactSeatMapResult {
  rows: ReactSeatRow[];
  layoutLength: number;
}

export function convertSeatMapToReactSeatmapFormat(
  seats: SeatInfo[],
  layoutLetters: string[]
): ReactSeatMapResult {
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

    const firstSeat = Object.values(letterSeatMap)[0];
    const deckId = firstSeat && 'deckId' in firstSeat ? (firstSeat as any).deckId : 'Maindeck';

    const isExitRow = Object.values(letterSeatMap).some(seat =>
      seat.seatCharacteristics?.includes('E')
    );

    const isOverwingRow = Object.values(letterSeatMap).some(
      seat =>
        seat.seatCharacteristics?.includes('OW') ||
        seat.rowTypeCode === 'K'
    );

    layoutLetters.forEach((col, idx) => {
      if (col === '|') {
        rowSeats.push({
          id: `AISLE-${rowNumber}-${idx}`,
          isReserved: true
        });
      } else {
        const seat = letterSeatMap[col];
        if (!seat) return;

        if (/^\d+$/.test(seat.seatNumber)) return;

        const isFakeSeat =
          seat.seatCharacteristics?.includes('GN') ||
          seat.seatCharacteristics?.includes('8');

        if (isFakeSeat) {
          rowSeats.push({
            id: `EMPTY-${rowNumber}-${col}`,
            number: '',
            isReserved: true,
            tooltip: '',
            seatCharacteristics: seat.seatCharacteristics,
          });
          return;
        }

        const isReserved = ['occupied', 'blocked', 'unavailable'].includes(
          seat.seatStatus.toLowerCase()
        );

        const characteristicFlags = seat.seatCharacteristics?.filter(code =>
          ['L', 'G', 'Z', 'B', 'Y', 'R', 'D'].includes(code)
        ).map(code => {
          switch (code) {
            case 'L': return 'Near lavatory';
            case 'G': return 'Near galley';
            case 'Z': return 'Extra legroom';
            case 'B': return 'Bulkhead';
            case 'Y': return 'Power outlet';
            case 'R': return 'Restricted recline';
            case 'D': return 'Bassinet seat';
            default: return '';
          }
        }) ?? [];

        const tooltip = [
          seat.seatCharacteristics?.includes('O') ? 'PREFERRED' : '',
          seat.seatPrice ? `€${seat.seatPrice.toFixed(2)}` : '',
          ...characteristicFlags
        ].filter(Boolean).join(' • ');

        rowSeats.push({
          id: seat.seatNumber,
          number: col,
          isReserved,
          tooltip,
          seatCharacteristics: seat.seatCharacteristics
        });
      }
    });

    result.push({
      rowNumber,
      seats: rowSeats,
      isExitRow,
      isOverwingRow,
      deckId
    });
  }

  return {
    rows: result.sort((a, b) => a.rowNumber - b.rowNumber),
    layoutLength: layoutLetters.length
  };
}