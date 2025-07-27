// file: code/components/seatMap/handleReassignSeats.ts

/**
 * handleReassignSeats.ts
 *
 * 🔁 Utility function to handle single seat reassignment in fallback mode.
 *
 * When a seat is removed for a specific passenger, this function:
 * - Filters out their assigned seat from the selectedSeats array
 * - Updates the selectedSeats state
 * - Brings the passenger back into focus for reassignment (sets as selected)
 *
 * Used by the PassengerPanel ❌ icon when reassigning a passenger's seat.
 */

import { SelectedSeat } from './types/types';

interface ReassignSeatParams {
  passengerId: string;
  selectedSeats: SelectedSeat[];
  setSelectedSeats: (seats: SelectedSeat[]) => void;
  setSelectedPassengerId: (id: string) => void;
}

/**
 * Removes the seat for a given passenger and marks them as the active selection.
 */
export function handleReassignSeat({
  passengerId,
  selectedSeats,
  setSelectedSeats,
  setSelectedPassengerId,
}: ReassignSeatParams) {
  const updatedSeats = selectedSeats.filter(s => s.passengerId !== passengerId);

  setSelectedSeats(updatedSeats);            // Update the state without the removed seat
  setSelectedPassengerId(passengerId);       // Bring the passenger into focus for reassignment
}