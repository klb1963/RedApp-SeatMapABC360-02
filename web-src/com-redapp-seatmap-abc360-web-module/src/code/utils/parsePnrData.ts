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

/**
 * PassengerOption — structured passenger model
 * used in dropdowns, seat assignment, and PNR-related UI.
 */
export interface PassengerOption extends Option<string> {
  id: string;
  value: string;
  givenName: string;
  surname: string;
  seatAssignment?: string;
  nameNumber?: string;
  passengerColor?: string;
}

/**
 * SegmentOption — structured flight segment model
 * used in dropdowns, selection UIs, and backend queries.
 */
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

/**
 * PnrData — parsed result of passengers and segments
 */
export interface PnrData {
  passengers: PassengerOption[];
  segments: SegmentOption[];
  assignedSeats?: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[];
  pnrLocator?: string;
}

export const parsePnrData = (xmlDoc: XMLDocument): PnrData => {
  const passengers: PassengerOption[] = [];
  const segments: SegmentOption[] = [];

// ===== 👤 Parse Passengers =====
const passengerNodes = xmlDoc.getElementsByTagName('stl19:Passenger');
for (let i = 0; i < passengerNodes.length; i++) {
  const passenger = passengerNodes[i];
  const id = passenger.getAttribute('id') || '';

  const surname = passenger.getElementsByTagName('stl19:LastName')[0]?.textContent?.trim() || '';

  // ✂️ Удаляем титулы типа MR, MRS, MS из имени
  const rawGivenName = passenger.getElementsByTagName('stl19:FirstName')[0]?.textContent?.trim() || '';
  const givenName = rawGivenName.replace(/\bMR\b|\bMRS\b|\bMS\b/gi, '').trim();

  const nameAssocId = passenger.getAttribute('nameAssocId') || '';
  const nameNumber = nameAssocId ? `${nameAssocId}.1` : undefined;

  let seatAssignment = 'not assigned';

  const seatNumberNode = passenger
    .getElementsByTagName('stl19:Seats')[0]
    ?.getElementsByTagName('stl19:PreReservedSeats')[0]
    ?.getElementsByTagName('stl19:PreReservedSeat')[0]
    ?.getElementsByTagName('stl19:SeatNumber')[0];

  const seatText = seatNumberNode?.textContent?.trim();
  if (seatText) {
    seatAssignment = seatText;
  }

  passengers.push({
    id,
    value: id,
    givenName,
    surname,
    label: `${surname}/${givenName}`,
    seatAssignment,
    nameNumber
  });
}

  // ===== ✈️ Parse Segments =====
  const airSegmentNodes = xmlDoc.getElementsByTagName('stl19:Air');
  for (let i = 0; i < airSegmentNodes.length; i++) {
    const segment = airSegmentNodes[i];

    const id = segment.getAttribute('id') || '';
    const origin = segment.getElementsByTagName('stl19:DepartureAirport')[0]?.textContent?.trim() || '';
    const destination = segment.getElementsByTagName('stl19:ArrivalAirport')[0]?.textContent?.trim() || '';
    const departureDateTime = segment.getElementsByTagName('stl19:DepartureDateTime')[0]?.textContent?.trim() || '';
    const marketingFlightNumber = segment.getElementsByTagName('stl19:MarketingFlightNumber')[0]?.textContent?.trim() || '';
    const marketingCarrier = segment.getElementsByTagName('stl19:MarketingAirlineCode')[0]?.textContent?.trim() || 'UNKNOWN';
    const airlineName = segment.getElementsByTagName('stl19:OperatingAirlineShortName')[0]?.textContent?.trim() || '';
    const bookingClass = segment.getElementsByTagName('stl19:OperatingClassOfService')[0]?.textContent?.trim() || '';
    const equipment = segment.getElementsByTagName('stl19:EquipmentType')[0]?.textContent?.trim() || '';

    let departureDate = '';
    if (departureDateTime.includes('T')) {
      departureDate = departureDateTime.split('T')[0];
    }

    const rawElapsedTime = segment.getElementsByTagName('stl19:ElapsedTime')[0]?.textContent?.trim();
    const durationMinutes = rawElapsedTime && rawElapsedTime.includes('.')
      ? (() => {
          const [hoursStr, minutesStr] = rawElapsedTime.split('.');
          const hours = parseInt(hoursStr, 10);
          const minutes = parseInt(minutesStr.padEnd(2, '0'), 10);
          return hours * 60 + minutes;
        })()
      : undefined;

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
      segmentNumber: String(i + 1),
      duration: durationMinutes,
    });
  }

  // === Retrieve PNR locator from the root element ===
  const pnrLocator = xmlDoc.getElementsByTagName('stl19:RecordLocator')[0]?.textContent?.trim() || '';

  return {
    passengers,
    segments,
    pnrLocator
  };

};
