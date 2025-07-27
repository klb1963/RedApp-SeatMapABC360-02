// file: code/components/seatMap/helpers/generatePassengersList.ts

/**
 * generatePassengersList.ts
 * 
 * 👥 Generates a formatted list of passenger objects for visual rendering in the SeatMap component.
 * 
 * Each object includes:
 * - Passenger ID and type
 * - Seat assignment from selectedSeats[]
 * - Label, color, and initials for display
 * - readOnly flag for interaction control
 * 
 * Used to prepare consistent visual data for all passengers displayed in the seat map UI.
 */

import { PassengerOption } from '../../../utils/parsePnrData';
import { SelectedSeat } from '../types/types';
import { getInitials } from './getInitials';
import { getPassengerColor } from './getPassengerColor';

export interface PassengerVisualInfo {
  id: string;
  passengerType: string;
  seat: { seatLabel: string } | null;
  passengerLabel: string;
  passengerColor: string;
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
    const abbr = getInitials(p);
    const label = `${p.surname}, ${p.givenName}`;
    const isReadOnly = pid !== selectedPassengerId;

    return {
      id: pid,
      passengerType: 'ADT',
      seat,
      passengerLabel: label,
      passengerColor: getPassengerColor(index),
      abbr,
      readOnly: isReadOnly
    };
  });
}