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

import { PassengerOption } from '../../../utils/parcePnrData';
import { SelectedSeat } from '../SeatMapComponentBase';
import { getInitials } from '../helpers/getInitials';
import { getPassengerColor } from '../helpers/getPassengerColor';

export function createPassengerPayload(
  passenger: PassengerOption,
  index: number,
  selectedPassengerId: string,
  selectedSeats: SelectedSeat[]
) {
  const pid = String(passenger.id ?? index);
  const seat = selectedSeats.find(s => s.passengerId === pid) || null;
  const readOnly = pid !== selectedPassengerId;
  const initials = getInitials(passenger);
  const color = getPassengerColor(index);

  return {
    id: pid,
    passengerType: 'ADT',
    seat,
    passengerLabel: passenger.label || `${passenger.givenName}/${passenger.surname}`,
    passengerColor: color,
    initials,
    abbr: initials,
    readOnly
  };
}