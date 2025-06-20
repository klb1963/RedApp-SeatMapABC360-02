export interface SeatInfo {
  seatNumber: string; // например, A, B, C
  seatStatus: string; // например, "Available", "Occupied"
  seatPrice?: number; // цена за место (если есть)
  seatCharacteristics?: string[]; // ["OW", "W", "CH", ...]
  tooltip?: string; // текст при наведении
  isReserved?: boolean; // зарезервировано
  rowTypeCode?: string; // "E" (Exit), "K" (Overwing), и др.
}