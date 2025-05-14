// file: code/components/seatMap/helpers/createPassengerPayload.ts

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