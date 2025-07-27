// file: code/components/seatMap/helpers/onDeleteSeat.ts

import { handleCancelSpecificSeat } from '../handleCancelSpecificSeat';
import { SelectedSeat } from '../SeatMapComponentBase';
import { PassengerOption } from '../../../utils/parsePnrData';

interface Params {
  seat: SelectedSeat;
  passengers: PassengerOption[];
  onSuccess: () => void;
}

/**
 * Handles the removal of a selected seat for a specific passenger.
 * 
 * 1. Finds the matching passenger by `passengerId`.
 * 2. Checks that required identifiers (name number and segment number) are present.
 * 3. Sends a request to cancel the seat assignment using Sabre (via handleCancelSpecificSeat).
 * 4. If successful, triggers the provided `onSuccess()` callback to update the UI.
 * 
 * @param seat - The seat to be removed (SelectedSeat)
 * @param passengers - Full list of passengers
 * @param onSuccess - Callback to refresh UI after deletion
 */
export const onDeleteSeat = async ({ seat, passengers, onSuccess }: Params) => {
  const pax = passengers.find(p => String(p.id) === seat.passengerId);
  if (!pax || !pax.nameNumber || !seat.segmentNumber) {
    alert('❌ Missing name number or segment number.');
    return;
  }

  const ok = await handleCancelSpecificSeat({
    nameNumber: pax.nameNumber,
    segmentNumber: seat.segmentNumber
  });

  if (ok) {
    onSuccess(); // trigger UI update: seat reset or re-render
  }
};