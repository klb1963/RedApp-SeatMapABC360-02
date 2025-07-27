// file: utils/normalizeSegment.ts

import { airlineNames } from './airlineNames';

// 🛩️ Equipment type code → full description
const EQUIPMENT_DESCRIPTIONS: Record<string, string> = {
  '388': 'Airbus A380-800',
  '359': 'Airbus A350-900',
  '358': 'Airbus A350-800',
  '343': 'Airbus A340-300',
  '346': 'Airbus A340-600',
  '333': 'Airbus A330-300',
  '321': 'Airbus A321',
  '320': 'Airbus A320',
  '319': 'Airbus A319',
  '738': 'Boeing 737-800',
  '739': 'Boeing 737-900',
  '77W': 'Boeing 777-300ER',
  '77L': 'Boeing 777-200LR',
  '772': 'Boeing 777-200',
  '773': 'Boeing 777-300',
  '788': 'Boeing 787-8 Dreamliner',
  '789': 'Boeing 787-9 Dreamliner',
  '78X': 'Boeing 787-10 Dreamliner',
  '763': 'Boeing 767-300',
  '764': 'Boeing 767-400',
  '747': 'Boeing 747',
};

export interface NormalizedSegment {
  marketingAirline: string;
  marketingAirlineName: string;
  flightNumber: string;
  departureDateTime: string;
  origin: string;
  originCityName: string;
  destination: string;
  destinationCityName: string;
  duration: string;
  equipmentType: string;
  aircraftDescription: string;
  segmentNumber: string;
}

export interface NormalizeSegmentOptions {
  padFlightNumber?: boolean;
}

/**
 * 🧭 normalizeSegment
 *
 * Extracts a normalized segment object from raw segment data (Sabre formats).
 * Handles fallback logic for all fields, supports both EnhancedAirBookRS and GetReservationRS structures.
 *
 * @param seg - Raw segment object (from Sabre)
 * @param options - Normalization options (e.g. padFlightNumber)
 * @returns NormalizedSegment - ready for display in SeatMap components
 */
export function normalizeSegment(
  seg: any,
  options: NormalizeSegmentOptions = {}
): NormalizedSegment {
  console.log('🧩!!! normalizeSegment input:', JSON.stringify(seg, null, 2));

  const { padFlightNumber = true } = options;

  // 🏷️ Airline code (e.g. LH, AF)
  const marketingAirline =
    seg.marketingCarrier ||
    seg.marketingAirline ||
    seg.MarketingAirline?.EncodeDecodeElement?.Code ||
    'XX';

  // 📛 Airline name: try direct name > lookup table > capitalized fallback
  const marketingAirlineName =
    seg.marketingAirlineName ||
    airlineNames[marketingAirline] ||                  // ✅ We use this mapping if no name is provided
    capitalize(seg.airlineName) ||
    seg.MarketingAirline?.EncodeDecodeElement?.SimplyDecoded ||
    'n/a';

  /**
   * ℹ️ Why airlineNames is still needed:
   * Some Sabre responses include only the carrier code (e.g. 'LH') without a decoded name.
   * In such cases, `airlineNames[code]` gives us a user-friendly fallback for display.
   * 
   * If `marketingAirlineName` is already present, the lookup is skipped.
   */

  // ✈️ Flight number (optional padding)
  const rawFlightNumber =
    seg.flightNumber || seg.marketingFlightNumber || seg.FlightNumber || '0';

  const flightNumber = padFlightNumber
    ? String(rawFlightNumber).padStart(4, '0') // e.g. 97 → 0097
    : String(Number(rawFlightNumber) || 0);    // remove leading zeros

  // 🗓️ Departure date/time
  const departureDateTime =
    seg.departureDateTime || seg.departureDate || seg.DepartureDateTime || '';

  // 🌍 Origin & destination
  const origin =
    seg.origin || seg.OriginLocation?.EncodeDecodeElement?.Code || '???';

  const originCityName =
    seg.originCityName || seg.OriginLocation?.cityName || '';

  const destination =
    seg.destination || seg.DestinationLocation?.EncodeDecodeElement?.Code || '???';

  const destinationCityName =
    seg.destinationCityName || seg.DestinationLocation?.cityName || '';

  // 🕐 Duration conversion (e.g. 435 → "7h 15m")
  const rawDuration = seg.duration ?? seg.ElapsedTime;
  const durationMinutes =
    typeof rawDuration === 'number'
      ? rawDuration
      : parseInt(rawDuration || '', 10) || 0;

  const duration =
    durationMinutes > 0
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      : '';

  // ✈️ Aircraft / Equipment details
  const equipment = seg.Equipment || seg.equipment || {};

  const rawEquipmentObject =
    equipment?.EncodeDecodeElement || equipment || {};

  const equipmentType =
    rawEquipmentObject.Code ||
    (typeof seg.equipment === 'string' ? seg.equipment : '') ||
    (typeof seg.Equipment === 'string' ? seg.Equipment : '') ||
    'n/a';

  const aircraftDescription =
    rawEquipmentObject.SimplyDecoded ||
    seg.aircraftDescription ||
    EQUIPMENT_DESCRIPTIONS[String(equipmentType)] ||  // fallback from known map
    'n/a';

  // Final normalized object
  const result: NormalizedSegment = {
    marketingAirline,
    marketingAirlineName,
    flightNumber,
    departureDateTime,
    origin,
    originCityName,
    destination,
    destinationCityName,
    duration,
    equipmentType,
    aircraftDescription,
    segmentNumber: String(seg.sequence ?? '')
  };

  console.log('✅ normalized:', result);
  return result;

  // 📦 Fallback for capitalizing free-text names
  function capitalize(input?: string): string {
    if (!input) return '';
    return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  }
}