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
import { SelectedSeat } from './types/types';

interface AutomateSeatingParams {
  passengers: PassengerOption[];
  availableSeats: AvailabilityItem[];
  segmentNumber: string;
}

// Generate passenger initials
function getInitials(surname: string, givenName: string): string {
  return `${surname.charAt(0)}${givenName.charAt(0)}`.toUpperCase();
}

function getAbbr(surname: string, givenName: string): string {
  return `${givenName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

export function handleAutomateSeating({
  passengers,
  availableSeats,
  segmentNumber,
}: AutomateSeatingParams): SelectedSeat[] {
  
  console.log('[AUTO] passengers:', passengers);
  console.log('[AUTO] availableSeats (raw):', availableSeats);
  console.log('[AUTO] segmentNumber:', segmentNumber);

  const assignments: SelectedSeat[] = [];

  // Filter available seats
  const freeSeats = availableSeats.filter(seat => {
    if (!['available'].includes(seat.type)) return false;
    const price = parseFloat(String(seat.price).replace(/[^\d.]/g, '')) || 0;
    return price === 0;
  });
  
  const paidSeats = availableSeats.filter(seat => {
    return seat.type === 'paid'; // только paid, исключая preferred
  });

  availableSeats.forEach(seat => {
    console.log(`label=${seat.label}, type=${seat.type}, price=${seat.price}`);
  });

  console.log('[AUTO] freeSeats:', freeSeats);
  console.log('[AUTO] paidSeats:', paidSeats);

  if (freeSeats.length > 0) {
    assignSeats(freeSeats);
  } else if (paidSeats.length > 0) {
    const proceed = confirm('No free seats available. Do you want to assign paid seats?');
    if (proceed) {
      assignSeats(paidSeats);
    } else {
      return [];
    }
  } else {
    alert('No available seats.');
    return [];
  }

  function assignSeats(seats: AvailabilityItem[]) {
    for (let i = 0; i < passengers.length; i++) {
      const pax = passengers[i];
      const seat = seats[i];
      if (!seat) break;

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
          price: seat.price ? String(seat.price) : 'USD 0',
        },
      });

    }
  }

  return assignments;
}