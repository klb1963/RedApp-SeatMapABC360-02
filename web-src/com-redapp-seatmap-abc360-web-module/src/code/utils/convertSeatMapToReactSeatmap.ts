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
  
  /**
   * Преобразует массив SeatInfo[] из EnhancedSeatMapRQ в формат, понятный react-seatmap
   */
  export function convertSeatMapToReactSeatmapFormat(seats: SeatInfo[]): ReactSeatRow[] {
    const rowsMap: Record<number, ReactSeat[]> = {};
  
    for (const seat of seats) {
      const rowMatch = seat.seatNumber.match(/^(\d+)([A-Z])$/);
      if (!rowMatch) continue;
  
      const rowNumber = parseInt(rowMatch[1], 10);
      const column = rowMatch[2];
      const isReserved = seat.seatStatus !== 'Available';
  
      if (!rowsMap[rowNumber]) {
        rowsMap[rowNumber] = [];
      }
  
      rowsMap[rowNumber].push({
        id: seat.seatNumber,
        number: column,
        isReserved,
        tooltip: seat.seatPrice ? `€${seat.seatPrice.toFixed(2)}` : undefined,
      });
    }
  
    return Object.entries(rowsMap)
      .map(([rowNumberStr, seats]) => ({
        rowNumber: parseInt(rowNumberStr, 10),
        seats: seats.sort((a, b) => a.number!.localeCompare(b.number!)),
      }))
      .sort((a, b) => a.rowNumber - b.rowNumber);
  }