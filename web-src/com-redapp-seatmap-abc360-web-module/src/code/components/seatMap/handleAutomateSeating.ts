// file: code/components/seatMap/handleAutomateSeating.ts

import { PassengerOption } from '../../utils/parsePnrData';
import { AvailabilityItem } from '../../utils/parseSeatMapResponse';
import { SelectedSeat } from './SeatMapComponentBase';

interface AutomateSeatingParams {
  passengers: PassengerOption[];
  availableSeats: AvailabilityItem[];
}

function getInitials(surname: string, givenName: string): string {
  return `${surname.charAt(0)}${givenName.charAt(0)}`.toUpperCase();
}

function getAbbr(surname: string, givenName: string): string {
  return `${givenName.charAt(0)}${surname.charAt(0)}`.toUpperCase();
}

export function handleAutomateSeating({
  passengers,
  availableSeats,
}: AutomateSeatingParams): SelectedSeat[] {
  const assignments: SelectedSeat[] = [];

  const freeSeats = availableSeats.filter(seat => seat.type === 'available');

  if (freeSeats.length === 0) {
    alert('No available seats');
    return [];
  }

  for (let i = 0; i < passengers.length; i++) {
    const pax = passengers[i];
    const seat = freeSeats[i];
    if (!seat) break;

    assignments.push({
      passengerId: String(pax.id),
      seatLabel: seat.label,
      passengerType: 'ADT',
      passengerLabel: pax.value,
      passengerColor: pax.passengerColor || 'gray',
      initials: getInitials(pax.surname, pax.givenName),
      abbr: getAbbr(pax.surname, pax.givenName),
      readOnly: false,
      seat: {
        seatLabel: seat.label,
        price: 'USD 0',
      },
    });
  }

  return assignments;
}