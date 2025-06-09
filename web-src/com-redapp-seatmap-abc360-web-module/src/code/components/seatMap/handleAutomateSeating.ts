// file: code/components/seatMap/handleAutomateSeating.ts

/**
 * 🚀 handleAutomateSeating.ts
 *
 * This module provides a utility function for automatic seat assignment.
 * It takes a list of passengers and a list of available seats, 
 * then assigns the first free seats to the passengers in order.
 * This logic is used in the SeatMap ABC 360 RedApp.
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

// Generate passenger initials
function getAbbr(surname: string, givenName: string): string {
  return `${givenName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

// Main function for automatic seating
export function handleAutomateSeating({
  passengers,
  availableSeats,
  segmentNumber,
}: AutomateSeatingParams): SelectedSeat[] {
  const assignments: SelectedSeat[] = [];

  // Filter out available seats only
  const freeSeats = availableSeats.filter(seat => seat.type === 'available');

  // If no free seats are available, show alert and return empty array
  if (freeSeats.length === 0) {
    alert('No available seats');
    return [];
  }

  // Iterate over passengers and assign a free seat to each (1-to-1 order)
  for (let i = 0; i < passengers.length; i++) {
    const pax = passengers[i];
    const seat = freeSeats[i];
    if (!seat) break; // Exit if not enough seats

    assignments.push({
      passengerId: String(pax.id),
      seatLabel: seat.label,
      passengerType: 'ADT',
      passengerLabel: pax.value,
      passengerColor: pax.passengerColor || 'gray',
      initials: getInitials(pax.surname, pax.givenName),
      abbr: getAbbr(pax.surname, pax.givenName),
      readOnly: false,
      segmentNumber,
      seat: {
        seatLabel: seat.label,
        price: 'USD 0', // Placeholder price for automatic assignment
      },
    });
  }

  return assignments;
}