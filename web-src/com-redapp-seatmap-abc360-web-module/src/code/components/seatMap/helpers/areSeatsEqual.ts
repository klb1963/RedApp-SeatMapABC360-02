// file: code/components/seatMap/helpers/areSeatsEqual.ts

/**
 * areSeatsEqual.ts
 * 
 * 🧩 Utility function to compare two arrays of selected seats for equality.
 *
 * This helper checks if two arrays of `SelectedSeat` objects represent the same
 * seat assignments, by comparing passengerId and seatLabel for each passenger.
 * 
 * Use case:
 * - Can be used to prevent unnecessary updates when seat assignments haven't changed.
 * - Helpful for memoization, effects, or debugging.
 * 
 * Status:
 * - Currently unused in SeatMapComponentBase.
 * - Kept in codebase as a potential optimization utility.
 */

import { SelectedSeat } from '../SeatMapComponentBase';

/**
 * Compares two arrays of SelectedSeat objects.
 *
 * @param a - The first array of SelectedSeat objects
 * @param b - The second array of SelectedSeat objects
 * @returns true if both arrays have the same length and the same passenger-seat assignments
 */
export function areSeatsEqual(
  a: SelectedSeat[],
  b: SelectedSeat[]
): boolean {
  // If arrays have different lengths, they cannot be equal
  if (a.length !== b.length) return false;

  // Define a sorting key for consistent comparison
  const sortFn = (s: SelectedSeat) => `${s.passengerId}-${s.seatLabel}`;

  // Sort both arrays to ensure same order for comparison
  const aSorted = [...a].sort((x, y) => sortFn(x).localeCompare(sortFn(y)));
  const bSorted = [...b].sort((x, y) => sortFn(x).localeCompare(sortFn(y)));

  // Check each corresponding seat assignment
  return aSorted.every((seat, index) =>
    seat.passengerId === bSorted[index].passengerId &&
    seat.seatLabel === bSorted[index].seatLabel
  );
}