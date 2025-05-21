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
import { getPassengerColor } from '../components/seatMap/helpers/getPassengerColor';


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
  nameNumber?: string; // Sabre NameAssocId + .1 (e.g. "2.1")
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
}

/**
 * PnrData — parsed result of passengers and segments
 */
export interface PnrData {
  passengers: PassengerOption[];
  segments: SegmentOption[];
}

/**
 * Parses STL-format XML from GetReservationRS into a normalized
 * object containing passengers and segments.
 *
 * @param xmlDoc - XMLDocument returned from Sabre GetReservationRS
 * @returns Parsed passengers and segments
 */
export const parsePnrData = (xmlDoc: XMLDocument): PnrData => {
  const passengers: PassengerOption[] = [];
  const segments: SegmentOption[] = [];

  // ===== 👤 Parse Passengers =====
  const passengerNodes = xmlDoc.getElementsByTagName('stl19:Passenger');
  for (let i = 0; i < passengerNodes.length; i++) {
    const passenger = passengerNodes[i];
    const id = passenger.getAttribute('id') || '';
    const surname = passenger.getElementsByTagName('stl19:LastName')[0]?.textContent?.trim() || '';
    const givenName = passenger.getElementsByTagName('stl19:FirstName')[0]?.textContent?.trim() || '';

    // ✅ Build external ref (NameNumber) from nameAssocId
    const nameAssocId = passenger.getAttribute('nameAssocId') || '';
    const nameNumber = nameAssocId ? `${nameAssocId}.1` : undefined;

    // 🪑 Optional seat assignment
    let seatAssignment: string = 'not assigned';
    const seatsNode = passenger.getElementsByTagName('stl19:Seats')[0];
    if (seatsNode) {
      const seatNode = seatsNode.getElementsByTagName('stl19:Seat')[0];
      const assignment = seatNode?.getAttribute('Assignment')?.trim();
      if (assignment) {
        seatAssignment = assignment;
      }
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
    const bookingClass = segment.getElementsByTagName('stl19:OperatingClassOfService')[0]?.textContent?.trim() || '';
    const equipment = segment.getElementsByTagName('stl19:EquipmentType')[0]?.textContent?.trim() || '';

    // 📆 Extract departure date (YYYY-MM-DD)
    let departureDate = '';
    if (departureDateTime.includes('T')) {
      departureDate = departureDateTime.split('T')[0];
    }

    segments.push({
      label: `${marketingCarrier}${marketingFlightNumber} — ${origin} → ${destination}`,
      value: id,
      origin,
      destination,
      departureDate,
      marketingCarrier,
      marketingFlightNumber,
      bookingClass,
      equipment
    });
  }

  passengers.forEach((p, i) => {
    p.passengerColor = getPassengerColor(i);
  });

  return { passengers, segments };
};