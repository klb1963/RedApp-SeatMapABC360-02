import { SeatAssignment } from './types/SeatAssigment';

/**
 * 🧩 buildSelectedSeats
 *
 * Converts internal seatsBySegment state into an array of SeatAssignment
 * that can be passed to handleSaveSeats().
 *
 * @param seatsBySegment State object: segment -> passenger -> seatLabel
 * @returns SeatAssignment[]
 */
export function buildSelectedSeats(
  seatsBySegment: Record<string, Record<string, string>>
): SeatAssignment[] {
  const selectedSeats: SeatAssignment[] = [];

  for (const [segmentNumber, paxSeats] of Object.entries(seatsBySegment)) {
    for (const [passengerId, seatLabel] of Object.entries(paxSeats)) {
      if (!seatLabel) continue;

      selectedSeats.push({
        passengerId,
        seatLabel,
        segmentNumber
      });
    }
  }

  return selectedSeats;
}