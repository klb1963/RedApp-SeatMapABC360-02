// file: /code/utils/generateFlightData.ts 

/**
 * generateFlightData.ts
 *
 * 🛫 Utility to normalize raw flight segment input into the structured format
 * expected by the SeatMap visualization library (JETS).
 *
 * Accepts raw Sabre segment data (from PNR, pricing, shopping, availability),
 * and returns a normalized FlightData object.
 */

import { mapCabinToCode } from '../utils/mapCabinToCode';
import { extractStartAndEndRowFromCabin } from './extractStartEndRow';

/**
 * Flight segment input structure from various Sabre APIs.
 */
export interface FlightSegmentInput {
  marketingAirline?: string;
  marketingCarrier?: string;
  flightNumber?: string;
  marketingFlightNumber?: string;
  departureDateTime?: string;
  departureDate?: string;
  origin?: string;
  departure?: string;
  destination?: string;
  arrival?: string;
  cabinClass?: string;
  equipment?: string | {
    EncodeDecodeElement?: {
      Code?: string;
      FullyDecoded?: string;
      SimplyDecoded?: string;
    };
  };
  equipmentType?: string;
  cabinXml?: Element; // Optional full cabin XML for row extraction
  enhancedSeatMapXml?: Document;
}

/**
 * Normalized flight data format used by the seat map library.
 */
export interface FlightData {
  id: string;
  airlineCode: string;
  flightNo: string;
  departureDate: string;
  departure: string;
  arrival: string;
  cabinClass: string;
  equipment: string;
  marketingCarrier?: string;
  passengerType: string; // Always 'ADT' (Adult) for now
  startRow?: string; // 🆕 Added for seat map library schema
  endRow?: string;   // 🆕
}

/**
 * Generates a normalized FlightData object from raw segment input.
 *
 * @param segment - Raw segment object from Sabre or shared context
 * @param index - Index of the segment (used for ID)
 * @param cabinClassOverride - Optional cabin override (Y, C, F, etc.)
 * @returns A FlightData object ready for rendering in the seat map
 */
export function generateFlightData(
  segment: FlightSegmentInput,
  index: number,
  cabinClassOverride?: string
): FlightData {

  console.log('[📥 Incoming segment]', segment);

  // ✈️ Airline code logic
  const airlineCode = segment.marketingAirline || segment.marketingCarrier || 'XX';

  // 🔢 Flight number fallback logic
  const flightNoRaw = segment.flightNumber || segment.marketingFlightNumber || '000';
  const flightNo = String(flightNoRaw).replace(/^0+/, '') || '0';

  // 📅 Normalize departure date
  const rawDate = segment.departureDateTime || segment.departureDate || '';
  const departureDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;

  // 🌍 Departure / Arrival airport codes
  const departure = segment.origin || segment.departure || '???';
  const arrival = segment.destination || segment.arrival || '???';

  // 🛫 Aircraft equipment description
  const rawEquipment = segment.equipmentType || '';

  // 💺 Cabin class logic – use override as-is, only map if missing
  const mappedCabin =
    cabinClassOverride !== undefined
      ? cabinClassOverride
      : mapCabinToCode(segment.cabinClass || 'Y');

  // 🧰 Final object construction
  const result: FlightData = {
    id: String(index).padStart(3, '0'),
    airlineCode,
    flightNo,
    departureDate,
    departure,
    arrival,
    cabinClass: mappedCabin,
    equipment: rawEquipment,
    marketingCarrier: airlineCode,
    passengerType: 'ADT'
  };

// ⬆️ Optionally enrich with startRow/endRow if valid pair exists
if (segment.enhancedSeatMapXml) {
  const rows = extractStartAndEndRowFromCabin(segment.enhancedSeatMapXml);
  if (rows.startRow && rows.endRow) {
    result.startRow = rows.startRow;
    result.endRow = rows.endRow;
  }
}

  console.log('[✅ FlightData Ready]', result);

  return result;
}
