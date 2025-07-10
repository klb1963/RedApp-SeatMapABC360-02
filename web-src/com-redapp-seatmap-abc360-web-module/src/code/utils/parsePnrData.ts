// file: /code/utils/parsePnrData.ts

/**
 * parcePnrData.ts
 *
 * 📦 Utility for parsing a PNR XML document (Sabre STL format)
 * into structured passenger and segment data for use in UI components.
 *
 * - Extracts all passengers with seat assignment and nameNumber
 * - Extracts flight segments with basic marketing and departure info
 */

import { Option } from 'sabre-ngv-UIComponents/advancedDropdown/interfaces/Option';

export interface PassengerOption extends Option<string> {
  id: string;
  value: string;
  givenName: string;
  surname: string;
  seatAssignment?: string;
  nameNumber?: string;
  passengerColor?: string;
}

export interface SegmentOption extends Option<string> {
  origin: string;
  destination: string;
  departureDate: string;
  marketingCarrier: string;
  marketingFlightNumber: string;
  bookingClass: string;
  equipment: string;
  segmentNumber: string;
  duration: number;
  airlineName?: string;
}

export interface PnrData {
  passengers: PassengerOption[];
  segments: SegmentOption[];
  assignedSeats: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[];
  pnrLocator?: string;
}

export const parsePnrData = (xmlDoc: XMLDocument): PnrData => {
  const passengers: PassengerOption[] = [];
  const segments: SegmentOption[] = [];
  const assignedSeats: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[] = [];

  const passengerMap: Record<string, string> = {}; // nameNumber → passengerId

  // 👤 Parse Passengers
  const passengerNodes = xmlDoc.getElementsByTagName('stl19:Passenger');
  for (let i = 0; i < passengerNodes.length; i++) {
    const passenger = passengerNodes[i];
    const id = passenger.getAttribute('id') || '';

    const surname = passenger.getElementsByTagName('stl19:LastName')[0]?.textContent?.trim() || '';
    const rawGivenName = passenger.getElementsByTagName('stl19:FirstName')[0]?.textContent?.trim() || '';
    const givenName = rawGivenName.replace(/\bMR\b|\bMRS\b|\bMS\b/gi, '').trim();

    const nameAssocId = passenger.getAttribute('nameAssocId') || '';
    const paddedAssocId = nameAssocId.padStart(2, '0');
    const nameNumber = paddedAssocId ? `${paddedAssocId}.01` : undefined;

    passengerMap[nameNumber || ''] = id;

    passengers.push({
      id,
      value: id,
      givenName,
      surname,
      label: `${surname}/${givenName}`,
      nameNumber,
      seatAssignment: 'not assigned'
    });
  }

  // ✈️ Parse Segments + Seats
  const segmentNodes = xmlDoc.getElementsByTagName('stl19:Segment');
  for (let i = 0; i < segmentNodes.length; i++) {
    const segment = segmentNodes[i];

    const id = segment.getAttribute('id') || '';
    const sequence = segment.getAttribute('sequence') || String(i + 1);

    const air = segment.getElementsByTagName('stl19:Air')[0];

    const origin = air?.getElementsByTagName('stl19:DepartureAirport')[0]?.textContent?.trim() || '';
    const destination = air?.getElementsByTagName('stl19:ArrivalAirport')[0]?.textContent?.trim() || '';
    const departureDateTime = air?.getElementsByTagName('stl19:DepartureDateTime')[0]?.textContent?.trim() || '';
    const marketingFlightNumber = air?.getElementsByTagName('stl19:MarketingFlightNumber')[0]?.textContent?.trim() || '';
    const marketingCarrier = air?.getElementsByTagName('stl19:MarketingAirlineCode')[0]?.textContent?.trim() || 'UNKNOWN';
    const airlineName = air?.getElementsByTagName('stl19:OperatingAirlineShortName')[0]?.textContent?.trim() || '';
    const bookingClass = air?.getElementsByTagName('stl19:OperatingClassOfService')[0]?.textContent?.trim() || '';
    const equipment = air?.getElementsByTagName('stl19:EquipmentType')[0]?.textContent?.trim() || '';

    let departureDate = '';
    if (departureDateTime.includes('T')) {
      departureDate = departureDateTime.split('T')[0];
    }

    const rawElapsedTime = air?.getElementsByTagName('stl19:ElapsedTime')[0]?.textContent?.trim();
    const durationMinutes = rawElapsedTime && rawElapsedTime.includes('.')
      ? (() => {
          const [hoursStr, minutesStr] = rawElapsedTime.split('.');
          const hours = parseInt(hoursStr, 10);
          const minutes = parseInt(minutesStr.padEnd(2, '0'), 10);
          return hours * 60 + minutes;
        })()
      : undefined;

    // 🪑 Assigned seats per segment
    const preSeats = air?.getElementsByTagName('stl19:PreReservedSeat');
    if (preSeats) {
      for (let j = 0; j < preSeats.length; j++) {
        const preSeat = preSeats[j];
        const seatNumber = preSeat.getElementsByTagName('stl19:SeatNumber')[0]?.textContent?.trim() || '';
        const nameNumber = preSeat.getElementsByTagName('stl19:NameNumber')[0]?.textContent?.trim() || '';
        if (seatNumber && nameNumber) {
          const passengerId = passengerMap[nameNumber];
          if (passengerId) {
            assignedSeats.push({
              passengerId,
              seat: seatNumber,
              segmentNumber: sequence
            });
            // для совместимости обновим seatAssignment в passengers
            const pax = passengers.find(p => p.id === passengerId);
            if (pax && pax.seatAssignment === 'not assigned') {
              pax.seatAssignment = seatNumber;
            }
          }
        }
      }
    }

    segments.push({
      label: `${marketingCarrier}${marketingFlightNumber} — ${origin} → ${destination}`,
      value: id,
      origin,
      destination,
      departureDate,
      marketingCarrier,
      airlineName,
      marketingFlightNumber,
      bookingClass,
      equipment,
      segmentNumber: sequence,
      duration: durationMinutes
    });
  }

  const pnrLocator = xmlDoc.getElementsByTagName('stl19:RecordLocator')[0]?.textContent?.trim() || '';

  return {
    passengers,
    segments,
    assignedSeats,
    pnrLocator
  };
};
