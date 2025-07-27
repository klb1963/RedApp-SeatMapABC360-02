// file: /code/components/seatMap/types/SeatAssigment.ts

/**
 * SeatAssignment
 * 
 * 🎫 Represents a single passenger's seat assignment for a given flight segment.
 * 
 * Used to track which passenger is seated at which seat on which segment.
 * Typically populated from Sabre PNR data or internal assignment state.
 * 
 * Fields:
 * - passengerId: Unique identifier of the passenger
 * - seatLabel: Seat identifier (e.g., "12A")
 * - segmentNumber: Sabre segment reference number (not array index), e.g. "2" or "4".
 *   This is parsed as a string from Sabre XML — commonly from attributes like
 *    <stl19:Segment sequence="1" id="5">
 *   It's important to treat it as a string to ensure correct matching between
 *   seat assignments and flight segments.
 */

export interface SeatAssignment {
  passengerId: string;
  seatLabel: string;
  segmentNumber: string;
}