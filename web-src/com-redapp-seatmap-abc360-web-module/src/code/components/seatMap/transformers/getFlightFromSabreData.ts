// file: code/components/SeatMap/getFlightFromSabreData.ts

/**
 * Extracts normalized flight segment data from raw Sabre response.
 *
 * This helper parses a single flight segment, handling various structural formats
 * returned by Sabre APIs (e.g., EnhancedAirBookRS, GetReservationRS).
 * 
 * It returns a simplified flight object with:
 * - airline code
 * - flight number
 * - origin and destination airport codes
 * - departure date (YYYY-MM-DD)
 * - cabin class
 * - aircraft equipment description
 * 
 * If the segment is missing or cannot be parsed, the function returns `null`.
 *
 * @param data - Full response object that contains `flightSegments` array
 * @param segmentIndex - Index of the segment to extract (default = 0)
 * @returns Normalized flight object or null if parsing fails
 */

export const getFlightFromSabreData = (
  data: any,
  segmentIndex: number = 0
) => {
  const segment = data.flightSegments?.[segmentIndex];

  if (!segment) {
    console.warn(`⚠️ Segment index ${segmentIndex} not found`);
    return null;
  }

  console.log('🔍 Current segment:', segment);

  const airlineCode =
    segment?.MarketingAirline?.EncodeDecodeElement?.Code ||
    segment?.marketingAirline ||
    'XX';

  const flightNo =
    segment?.FlightNumber ||
    segment?.flightNumber ||
    '000';

  const origin =
    segment?.OriginLocation?.EncodeDecodeElement?.Code ||
    segment?.origin ||
    '???';

  const destination =
    segment?.DestinationLocation?.EncodeDecodeElement?.Code ||
    segment?.destination ||
    '???';

  const rawDeparture =
    segment?.departureDate ||
    segment?.departureDateTime || 
    '';

  const departureDate = rawDeparture
    ? new Date(rawDeparture).toISOString().split('T')[0]
    : '';

  if (!departureDate) {
    console.warn('⚠️ Failed to extract departure date from:', rawDeparture);
  } else {
    console.log('📅 Departure date extracted:', departureDate);
  }

  const cabinClass = segment?.cabinClass || 'E';

  const equipment =
  segment?.Equipment?.EncodeDecodeElement?.SimplyDecoded ||
  segment?.equipment ||
  '';

  const result = {
    id: '111',
    airlineCode,
    flightNo,
    departureDate,
    departure: origin,
    arrival: destination,
    cabinClass: cabinClass,
    passengerType: 'ADT',
    equipment
  };

  console.log('✅ [getFlightFromSabreData] Finl object flight:', result);

  return result;
};