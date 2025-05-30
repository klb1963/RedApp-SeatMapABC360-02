// file: code/components/seatMap/helpers/createPassengerPayload.ts

/**
 * createPassengerPayload.ts
 * 
 * 🎫 Helper function for building the passenger data object used by the SeatMap library.
 * 
 * Features:
 * - Derives passenger ID from input or index
 * - Attaches seat assignment from selectedSeats[]
 * - Sets readOnly flag based on currently active passenger
 * - Computes initials and visual color for labeling
 * 
 * Used inside SeatMapComponentBase to transform PassengerOption into a format
 * required by the seat map rendering library.
 */

import { PassengerOption } from '../../../utils/parsePnrData';
import { SelectedSeat } from '../SeatMapComponentBase';
import { getInitials } from '../helpers/getInitials';
import { getPassengerColor } from '../helpers/getPassengerColor';

/**
 * Transforms a PassengerOption into a payload accepted by the SeatMap iframe.
 */
export function createPassengerPayload(
  passenger: PassengerOption,
  index: number,
  selectedPassengerId: string,
  selectedSeats: SelectedSeat[]
) {
  const passengerId = String(passenger.id ?? index);
  const selected = selectedSeats.find(s => s.passengerId === passengerId) || null;

  const seat = selected
    ? {
        seatLabel: selected.seatLabel,
        price: selected.seat?.price || 'USD 0'
      }
    : null;

  const color = passenger.passengerColor || getPassengerColor(index);
  const label = `${passenger.surname}, ${passenger.givenName}`;
  const abbr = getInitials(passenger);

  return {
    id: passengerId,
    passengerType: 'ADT',
    seat,
    passengerLabel: label,
    passengerColor: color,
    abbr,
    readOnly: passengerId !== selectedPassengerId && !!seat
  };
}