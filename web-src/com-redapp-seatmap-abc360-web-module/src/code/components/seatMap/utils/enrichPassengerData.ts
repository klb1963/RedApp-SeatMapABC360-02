// ✅ file: /code/utils/enrichPassengerData.ts

/**
 * enrichPassengerData.ts
 *
 * ✨ Enriches parsed passenger data with additional UI-specific properties:
 * - Assigns passengerColor based on index
 * - Creates assignedSeats array for use in seat selection UIs
 */

import { PassengerOption } from '../../../utils/parsePnrData';
import { getPassengerColor } from '../helpers/getPassengerColor';

export const enrichPassengerData = (passengers: PassengerOption[]) => {
  const enrichedPassengers = passengers.map((p, i) => ({
    ...p,
    passengerColor: getPassengerColor(i),
  }));

  const assignedSeats = enrichedPassengers
    .filter(p => p.seatAssignment && p.seatAssignment !== 'not assigned')
    .map(p => ({
      passengerId: p.id,
      seat: p.seatAssignment,
      segmentNumber: '1', // FIXME: adjust for multiple segments later
    }));

  return {
    enrichedPassengers,
    assignedSeats,
  };
};
