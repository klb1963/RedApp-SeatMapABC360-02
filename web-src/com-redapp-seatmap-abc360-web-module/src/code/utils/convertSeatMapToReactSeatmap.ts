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

export interface ReactSeatMapResult {
  rows: ReactSeatRow[];
  layoutLength: number;
}

export function convertSeatMapToReactSeatmapFormat(
  seats: SeatInfo[],
  layoutLetters: string[]
): ReactSeatMapResult {
  // Organize seats by row number, then by seat letter
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

  // For each row, construct a visual row object
  for (const [rowNumberStr, letterSeatMap] of Object.entries(rowsMap)) {
    const rowNumber = parseInt(rowNumberStr, 10);
    const rowSeats: ReactSeat[] = [];

    layoutLetters.forEach((col, idx) => {
      // If the layoutLetter is '|', treat it as an aisle
      if (col === '|') {
        rowSeats.push({
          id: `AISLE-${rowNumber}-${idx}`,
          isReserved: true, // aisle is not selectable
        });
      } else {
        const seat = letterSeatMap[col];
        if (!seat) return;

        // 🔍 Filter out non-physical ("fake") seats based on seatCharacteristics
        const isFakeSeat =
          seat.seatCharacteristics?.includes('GN') || // Galley / No seat here
          seat.seatCharacteristics?.includes('8');    // NoSeatAtThisLocation

        if (isFakeSeat) {
          console.log(`⛔ Skipping fake seat: ${seat.seatNumber}`);
          return;
        }

        // Determine if seat is already reserved/unavailable
        const isReserved = ['occupied', 'blocked', 'unavailable'].includes(
          seat.seatStatus.toLowerCase()
        );

        // Build the seat object for rendering
        rowSeats.push({
          id: seat.seatNumber,
          number: col,
          isReserved,
          tooltip: [
            seat.seatCharacteristics?.includes('O') ? 'PREFERRED' : '',
            seat.seatPrice ? `€${seat.seatPrice.toFixed(2)}` : '',
          ]
            .filter(Boolean)
            .join(' '), // Combine tooltip parts if present
        });
      }
    });

    // Add processed row to result
    result.push({ rowNumber, seats: rowSeats });
  }

  return {
    rows: result.sort((a, b) => a.rowNumber - b.rowNumber), // Sort rows numerically
    layoutLength: layoutLetters.length, // Used to align seat rows visually
  };
}