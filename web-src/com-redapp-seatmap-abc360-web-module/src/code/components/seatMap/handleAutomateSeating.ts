// file: code/components/seatMap/handleAutomateSeating.ts

/**
 * 🚀 handleAutomateSeating.ts
 *
 * This module provides a utility function for automatic seat assignment.
 * It assigns free seats to passengers in order.
 * If no free (zero-price) seats are found, asks the user if paid seats should be assigned.
 */

import { PassengerOption } from '../../utils/parsePnrData';
import { AvailabilityItem } from '../../utils/parseSeatMapResponse';
import { SelectedSeat } from './SeatMapComponentBase';

interface AutomateSeatingParams {
  passengers: PassengerOption[];
  availableSeats: AvailabilityItem[];
  segmentNumber: string;
}

// Generate passenger initials
function getInitials(surname: string, givenName: string): string {
  return `${surname.charAt(0)}${givenName.charAt(0)}`.toUpperCase();
}

// Generate passenger abbreviation
function getAbbr(surname: string, givenName: string): string {
  return `${givenName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

export function handleAutomateSeating({
  passengers,
  availableSeats,
  segmentNumber,
}: AutomateSeatingParams): SelectedSeat[] {
  const assignments: SelectedSeat[] = [];

  // Сначала ищем только бесплатные места
  let freeSeats = availableSeats.filter(seat => seat.type === 'available');

  if (freeSeats.length === 0) {
    const proceedWithPaid = confirm(
      'No free seats available. Do you want to assign paid seats?'
    );
    if (!proceedWithPaid) {
      return [];
    }

    // Если согласился — берем платные
    freeSeats = availableSeats.filter(seat => seat.type === 'paid');
    if (freeSeats.length === 0) {
      alert('No paid seats available either.');
      return [];
    }
  }

  for (let i = 0; i < passengers.length; i++) {
    const pax = passengers[i];
    const seat = freeSeats[i];
    if (!seat) break; // если мест меньше чем пассажиров

    assignments.push({
      passengerId: String(pax.id),
      seatLabel: seat.label,
      passengerType: 'ADT',
      passengerLabel: pax.value,
      passengerColor: pax.passengerColor || 'gray',
      initials: getInitials(pax.surname, pax.givenName),
      abbr: getAbbr(pax.surname, pax.givenName),
      passengerInitials: getInitials(pax.surname, pax.givenName),
      readOnly: false,
      segmentNumber,
      seat: {
        seatLabel: seat.label,
        price: String(seat.price || 'USD 0'),
      },
    });
  }

  return assignments;
}