// file: /code/components/seatMap/types/SeatInfo.ts

/**
 * SeatInfo
 * 
 * 🪑 Represents a single seat's metadata as parsed from the Sabre seat map response.
 * Used for building the visual seat layout and handling seat selection logic.
 * 
 * Fields:
 * - seatNumber: Letter or identifier of the seat within the row (e.g., "A", "B", "C")
 * - seatStatus: Availability status (e.g., "Available", "Occupied", "Blocked")
 * - seatPrice: Optional price for selecting this seat (in numeric format)
 * - seatCharacteristics: Array of raw codes describing seat features 
 *   (e.g., ["OW"] = Overwing, ["CH"] = Child allowed, ["G"] = Galley nearby)
 * - tooltip: Optional description shown on hover (for enhanced UX)
 * - isReserved: True if this seat is currently assigned (used for locking seats)
 * - rowTypeCode: Code describing special row properties (e.g., "E" = Exit row, "K" = Overwing row)
 * - cabinClass: Class of service (e.g., "Y" = Economy, "C" = Business)
 */

export interface SeatInfo {
  seatNumber: string;
  seatStatus: string;
  seatPrice?: number;
  seatCharacteristics?: string[];
  tooltip?: string;
  isReserved?: boolean;
  rowTypeCode?: string;
  cabinClass?: string;
}