// file: /code/utils/convertSeatMapToReactSeatmap.ts

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
  isExitRow?: boolean;
  isOverwingRow?: boolean;
  deckId?: string; // 🆕 добавлено для поддержки мультидек
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

  // 🧩 Сначала собираем все кресла по строкам и буквам
  for (const seat of seats) {
    const match = seat.seatNumber.match(/^(\d+)([A-Z])$/);
    if (!match) continue;

    const rowNumber = match[1];
    const letter = match[2];

    if (!rowsMap[rowNumber]) rowsMap[rowNumber] = {};
    rowsMap[rowNumber][letter] = seat;
  }

  const result: ReactSeatRow[] = [];

  // 🔁 Обрабатываем каждую строку, собираем из неё массив ReactSeat[]
  for (const [rowNumberStr, letterSeatMap] of Object.entries(rowsMap)) {
    const rowNumber = parseInt(rowNumberStr, 10);
    const rowSeats: ReactSeat[] = [];

    const firstSeat = Object.values(letterSeatMap)[0];
    const deckId = firstSeat && 'deckId' in firstSeat ? (firstSeat as any).deckId : 'Maindeck'; // 🆕

    // console.log(`🎯 Seat ${firstSeat?.seatNumber} → deckId = ${deckId}`); // new log

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
        // 🚪 Проход между кресел
        rowSeats.push({
          id: `AISLE-${rowNumber}-${idx}`,
          isReserved: true
        });
      } else {
        const seat = letterSeatMap[col];
        if (!seat) return;

        // console.log('🚨 Проверка места:', seat.seatNumber, seat.seatCharacteristics, seat.seatStatus);

        // ❌ Пропускаем "места", которые — просто цифры, без букв (например, "60")
        if (/^\d+$/.test(seat.seatNumber)) return;

        // 🪑 Пропускаем места с характеристиками GN (галерея) или кодом 8 (no seat)
        const isFakeSeat =
          seat.seatCharacteristics?.includes('GN') ||
          seat.seatCharacteristics?.includes('8');

        if (isFakeSeat) {
          rowSeats.push({
            id: `EMPTY-${rowNumber}-${col}`,
            number: '',
            isReserved: true,
            tooltip: '',
          });
          return;
        }

        const isReserved = ['occupied', 'blocked', 'unavailable'].includes(
          seat.seatStatus.toLowerCase()
        );

        // 📝 Формируем тултип: если место платное или предпочтительное
        const tooltip = [
          seat.seatCharacteristics?.includes('O') ? 'PREFERRED' : '',
          seat.seatPrice ? `€${seat.seatPrice.toFixed(2)}` : ''
        ].filter(Boolean).join(' ');

        rowSeats.push({
          id: seat.seatNumber,
          number: col,
          isReserved,
          tooltip
        });
      }
    });

    // ✅ Добавляем строку с данными
    console.log(`🧩 row ${rowNumber} → ${rowSeats.length} seats`);

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