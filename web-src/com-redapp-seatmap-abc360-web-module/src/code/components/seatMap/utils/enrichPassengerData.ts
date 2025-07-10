// ✅ file: /code/utils/enrichPassengerData.ts

/**
 * enrichPassengerData.ts
 *
 * ✨ Enriches parsed passenger data with additional UI-specific properties:
 * - Assigns passengerColor based on index
 * - Adds passengerInitials for UI badges
 */

import { PassengerOption } from '../../../utils/parsePnrData';
import { getPassengerColor } from '../helpers/getPassengerColor';

export const enrichPassengerData = (passengers: PassengerOption[]) => {
  const enrichedPassengers = passengers.map((p, i) => {
    const initials = `${p.givenName[0] || ''}${p.surname[0] || ''}`.toUpperCase();
    return {
      ...p,
      passengerColor: getPassengerColor(i),
      passengerInitials: initials,
    };
  });

  return enrichedPassengers;
};