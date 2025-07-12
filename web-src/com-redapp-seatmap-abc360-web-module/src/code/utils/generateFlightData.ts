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
  enhancedSeatMapXml?: Document; // Optional XML for seat map parsing
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
  startRow?: string;     // Optional: start row boundary for seat map schema
  endRow?: string;       // Optional: end row boundary for seat map schema
}

/**
 * Generates a normalized FlightData object from raw segment input.
 *
 * If startRow / endRow are provided explicitly (e.g., from enrichedAvailability),
 * they are used directly. Otherwise, the function falls back to extracting them
 * from enhancedSeatMapXml, if available.
 *
 * @param segment - Raw segment object from Sabre or shared context
 * @param index - Index of the segment (used for ID)
 * @param cabinClassOverride - Optional cabin override (Y, C, F, etc.)
 * @param startRowOverride - Optional explicit start row (e.g., from enrichedAvailability)
 * @param endRowOverride - Optional explicit end row (e.g., from enrichedAvailability)
 * @returns A FlightData object ready for rendering in the seat map
 */
export function generateFlightData(
  segment: FlightSegmentInput,
  index: number,
  cabinClassOverride?: string,
  startRowOverride?: string,
  endRowOverride?: string
): FlightData {
  console.log('[📥 Incoming segment]', segment);

  // Airline code logic
  const airlineCode = segment.marketingAirline || segment.marketingCarrier || 'XX';

  // Flight number fallback logic
  const flightNoRaw = segment.flightNumber || segment.marketingFlightNumber || '000';
  const flightNo = String(flightNoRaw).replace(/^0+/, '') || '0';

  // Normalize departure date
  const rawDate = segment.departureDateTime || segment.departureDate || '';
  const departureDate = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;

  // Departure / Arrival airport codes
  const departure = segment.origin || segment.departure || '???';
  const arrival = segment.destination || segment.arrival || '???';

  // Aircraft equipment description
  const rawEquipment = segment.equipmentType || '';

  // Cabin class logic – use override if provided
  const mappedCabin =
    cabinClassOverride !== undefined
      ? cabinClassOverride
      : mapCabinToCode(segment.cabinClass || 'Y');

  // Construct the final FlightData object
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

  // If explicit startRow/endRow are provided, use them directly
  if (startRowOverride && endRowOverride) {
    result.startRow = startRowOverride;
    result.endRow = endRowOverride;
  } else if (segment.enhancedSeatMapXml) {
    // Otherwise, attempt to extract from enhancedSeatMapXml
    const rows = extractStartAndEndRowFromCabin(segment.enhancedSeatMapXml);
    if (rows.startRow && rows.endRow) {
      result.startRow = rows.startRow;
      result.endRow = rows.endRow;
    }
  }
  console.log('???💡??? startRowOverride / endRowOverride passed in', startRowOverride, endRowOverride);
  console.log('[???✅??? FlightData Ready]', result);

  return result;
}