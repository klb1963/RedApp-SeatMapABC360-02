// file: code/components/seatMap/helpers/generatePassengersList.ts

import { PassengerOption } from '../../../utils/parcePnrData';
import { SelectedSeat } from '../SeatMapComponentBase';
import { getInitials } from './getInitials';
import { getPassengerColor } from './getPassengerColor';

export interface PassengerVisualInfo {
  id: string;
  passengerType: string;
  seat: { seatLabel: string } | null;
  passengerLabel: string;
  passengerColor: string;
  initials: string;
  abbr: string;
  readOnly: boolean;
}

export function generatePassengerList(
  passengers: PassengerOption[],
  selectedSeats: SelectedSeat[],
  selectedPassengerId: string
): PassengerVisualInfo[] {
  return passengers.map((p, index) => {
    const pid = String(p.id ?? index);
    const seat = selectedSeats.find((s) => s.passengerId === pid) || null;
    const initials = getInitials(p);
    const isReadOnly = pid !== selectedPassengerId;

    return {
      id: pid,
      passengerType: 'ADT',
      seat,
      passengerLabel: p.label || `${p.givenName}/${p.surname}`,
      passengerColor: getPassengerColor(index),
      initials,
      abbr: initials,
      readOnly: isReadOnly
    };
  });
}