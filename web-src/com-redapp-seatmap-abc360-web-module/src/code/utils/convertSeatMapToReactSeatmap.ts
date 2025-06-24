// file: /code/utils/convertSeatMapToReactSeatmap.ts

import { SeatInfo } from '../components/seatMap/types/SeatInfo';
import { getColorByType, SeatType } from './parseSeatMapResponse';

export interface ReactSeat {
  id: string;
  number?: string;
  isReserved?: boolean;
  tooltip?: string;
  seatCharacteristics?: string[];
  type: SeatType;
}

export interface ReactSeatRow {
  rowNumber: number;
  seats: ReactSeat[];
  isExitRow?: boolean;
  isOverwingRow?: boolean;
  isBulkheadRow?: boolean;
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

    const isBulkheadRow = Object.values(letterSeatMap).some(
      seat => seat.seatCharacteristics?.includes('K')
    );

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
          isReserved: true,
          type: 'blocked',
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
            type: 'blocked',
          });
          return;
        }
    
        // 💡 Определяем тип кресла (цвет)
        let type: SeatType = 'available';
    
        if (seat.seatCharacteristics?.includes('O')) {
          type = 'preferred';
        } else if (seat.seatPrice != null && seat.seatPrice > 0) {
          type = 'paid';
        } else if (['occupied', 'blocked', 'unavailable'].includes(seat.seatStatus.toLowerCase())) {
          type = seat.seatStatus.toLowerCase() as SeatType;
        }
    
        const characteristicsMap: Record<string, string> = {
          G: 'Near galley',
          L: 'Near lavatory',
          R: 'Limited recline',
          Y: 'Power outlet',
          Z: 'Extra legroom',
          B: 'Bassinet seat',
        };
        
        const flags = seat.seatCharacteristics?.filter(c => characteristicsMap[c]).map(c => characteristicsMap[c]) ?? [];
        
        const seatNumberWithClass = `• ${seat.cabinClass || 'Unknown'}`;

        const tooltipParts = [
          seatNumberWithClass,
          seat.seatPrice != null ? `USD ${seat.seatPrice.toFixed(2)}` : null,
          ...flags.map(flag => `• ${flag}`)
        ];
        
        const tooltip = tooltipParts.filter(Boolean).join('\n');
    
        rowSeats.push({
          id: seat.seatNumber,
          number: col,
          isReserved: ['occupied', 'blocked', 'unavailable'].includes(type),
          tooltip,
          seatCharacteristics: seat.seatCharacteristics,
          type,
        });
      }
    });

    result.push({
      rowNumber,
      seats: rowSeats,
      isExitRow,
      isOverwingRow,
      deckId,
      isBulkheadRow
    });
  }

  return {
    rows: result.sort((a, b) => a.rowNumber - b.rowNumber),
    layoutLength: layoutLetters.length
  };
}