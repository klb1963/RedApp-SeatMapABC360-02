// file: /code/utils/convertSeatMapToReactSeatmap.ts

/**
 * convertSeatMapToReactSeatmap.ts
 *
 * 🎯 Converts normalized SeatInfo array into a React-friendly seat map format.
 * 
 * Takes:
 * - `seats`: array of SeatInfo entries (each with seat number, characteristics, etc.)
 * - `layoutLetters`: array defining column layout (e.g. ['A', 'B', '|', 'C', 'D'])
 *
 * Returns:
 * - `rows`: array of seat rows with metadata (exit row, overwing, bulkhead, deckId, etc.)
 * - `layoutLength`: number of columns in layout
 *
 * Used for rendering fallback React-based seat map when iframe fails.
 */

import { SeatInfo } from '../components/seatMap/types/SeatInfo';
import { getColorByType, SeatType } from './parseSeatMapResponse';

// 🎫 Represents a single seat on the map
export interface ReactSeat {
  id: string;
  number?: string;
  isReserved?: boolean;
  tooltip?: string;
  seatCharacteristics?: string[];
  type: SeatType;
  hidden?: boolean; // used to skip rendering in fallback seat map
}

// 🪑 Represents a row of seats (including aisles)
export interface ReactSeatRow {
  rowNumber: number;
  seats: ReactSeat[];
  isExitRow?: boolean;
  isOverwingRow?: boolean;
  isBulkheadRow?: boolean;
  deckId?: string;
}

// 🗺️ Final seat map structure returned to the renderer
export interface ReactSeatMapResult {
  rows: ReactSeatRow[];
  layoutLength: number;
}

export function convertSeatMapToReactSeatmapFormat(
  seats: SeatInfo[],
  layoutLetters: string[]
): ReactSeatMapResult {
  const rowsMap: Record<string, Record<string, SeatInfo>> = {};

  // Group SeatInfo entries by row number and letter (e.g., 12A → rowsMap['12']['A'])
  for (const seat of seats) {
    const match = seat.seatNumber.match(/^(\d+)([A-Z])$/);
    if (!match) continue;

    const rowNumber = match[1];
    const letter = match[2];

    if (!rowsMap[rowNumber]) rowsMap[rowNumber] = {};
    rowsMap[rowNumber][letter] = seat;
  }

  const result: ReactSeatRow[] = [];

  // Process each row to build seat map rows
  for (const [rowNumberStr, letterSeatMap] of Object.entries(rowsMap)) {
    const rowNumber = parseInt(rowNumberStr, 10);
    const rowSeats: ReactSeat[] = [];

    // 💺 Row-level flags
    const isBulkheadRow = Object.values(letterSeatMap).some(
      seat => seat.seatCharacteristics?.includes('K')
    );
    const isExitRow = Object.values(letterSeatMap).some(seat =>
      seat.seatCharacteristics?.includes('E')
    );
    const isOverwingRow = Object.values(letterSeatMap).some(
      seat =>
        seat.seatCharacteristics?.includes('OW') ||
        seat.rowTypeCode === 'K'
    );

    // 🚪 Extract deckId from first seat in row
    const firstSeat = Object.values(letterSeatMap)[0];
    const deckId = firstSeat && 'deckId' in firstSeat ? (firstSeat as any).deckId : 'Maindeck';

    // Build each seat/aisle in the row
    layoutLetters.forEach((col, idx) => {
      if (col === '|') {
        // Insert aisle separator
        rowSeats.push({
          id: `AISLE-${rowNumber}-${idx}`,
          isReserved: true,
          type: 'blocked',
        });
      } else {
        const seat = letterSeatMap[col];

        if (!seat || !seat.seatNumber.match(/^\d+[A-Z]$/)) return;

        const isFakeSeat =
          seat.seatCharacteristics?.includes('GN') ||
          seat.seatCharacteristics?.includes('8');

        if (isFakeSeat) {
          // Invisible/fake seats like galley space
          rowSeats.push({
            id: `EMPTY-${rowNumber}-${col}`,
            number: '',
            isReserved: true,
            tooltip: '',
            seatCharacteristics: seat.seatCharacteristics,
            type: 'blocked',
            hidden: true,
          });
          return;
        }

        // 🎨 Determine seat type by rules
        let type: SeatType = 'available';

        if (seat.seatCharacteristics?.includes('O')) {
          type = 'preferred';
        } else if (seat.seatPrice != null && seat.seatPrice > 0) {
          type = 'paid';
        } else if (['occupied', 'blocked', 'unavailable'].includes(seat.seatStatus.toLowerCase())) {
          type = seat.seatStatus.toLowerCase() as SeatType;
        }

        // 🧷 Tooltip enhancements
        const characteristicsMap: Record<string, string> = {
          G: 'Near galley',
          LA: 'Near lavatory',
          R: 'Limited recline',
          Y: 'Power outlet',
          B: 'Bassinet seat',
          CH: 'Chargeable seat',
          L: 'Extra legroom',
          '1A': 'Not allowed for infants',
          V: 'Seat offered last',
          '1': 'Restricted seat',
        };

        const flags = seat.seatCharacteristics
          ?.filter(c => characteristicsMap[c])
          .map(c => characteristicsMap[c]) ?? [];

        const seatNumberWithClass = `• ${seat.cabinClass || 'Unknown'}`;
        const tooltipParts = [
          seatNumberWithClass,
          seat.seatPrice != null ? `USD ${seat.seatPrice.toFixed(2)}` : null,
          ...flags.map(flag => `• ${flag}`)
        ];

        const tooltip = tooltipParts.filter(Boolean).join('\n');

        // ✅ Push final seat object
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

    // ✅ Add processed row to result
    result.push({
      rowNumber,
      seats: rowSeats,
      isExitRow,
      isOverwingRow,
      isBulkheadRow,
      deckId
    });
  }

  return {
    rows: result.sort((a, b) => a.rowNumber - b.rowNumber),
    layoutLength: layoutLetters.length
  };
}