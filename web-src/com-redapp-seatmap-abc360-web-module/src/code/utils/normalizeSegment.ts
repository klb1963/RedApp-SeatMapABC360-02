

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
}

export interface NormalizeSegmentOptions {
  padFlightNumber?: boolean;
}

export function normalizeSegment(
  seg: any,
  options: NormalizeSegmentOptions = {}
): NormalizedSegment {
  console.log('🪵 TRACE: normalizeSegment called');
  console.log('🧩 normalizeSegment input:', seg);

  const { padFlightNumber = true } = options;

  const marketingAirline =
    seg.marketingCarrier ||
    seg.marketingAirline ||
    seg.MarketingAirline?.EncodeDecodeElement?.Code ||
    'XX';

  const marketingAirlineName =
    seg.marketingAirlineName ||
    /* airlineNames[marketingAirline] || */
    seg.airlineName ||  // заменили здесь
    seg.MarketingAirline?.EncodeDecodeElement?.SimplyDecoded ||
    'n/a';

  const rawFlightNumber =
    seg.flightNumber || seg.marketingFlightNumber || seg.FlightNumber || '0';

  const flightNumber = padFlightNumber
    ? String(rawFlightNumber).padStart(4, '0')
    : String(Number(rawFlightNumber) || 0);

  const departureDateTime =
    seg.departureDateTime || seg.departureDate || seg.DepartureDateTime || '';

  const origin =
    seg.origin || seg.OriginLocation?.EncodeDecodeElement?.Code || '???';

  const originCityName =
    seg.originCityName || seg.OriginLocation?.cityName || '';

  const destination =
    seg.destination || seg.DestinationLocation?.EncodeDecodeElement?.Code || '???';

  const destinationCityName =
    seg.destinationCityName || seg.DestinationLocation?.cityName || '';

  const rawDuration = seg.duration ?? seg.ElapsedTime;
  const durationMinutes =
    typeof rawDuration === 'number'
      ? rawDuration
      : parseInt(rawDuration || '', 10) || 0;

  const duration =
    durationMinutes > 0
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      : '';

  const equipment = seg.Equipment || seg.equipment || {};
  const rawEquipmentObject = equipment?.EncodeDecodeElement || equipment || {};

  const equipmentType =
    rawEquipmentObject.Code ||
    (typeof seg.equipment === 'string' ? seg.equipment : '') ||
    (typeof seg.Equipment === 'string' ? seg.Equipment : '') ||
    'n/a';

  const aircraftDescription =
    rawEquipmentObject.SimplyDecoded ||
    seg.aircraftDescription ||
    // EQUIPMENT_DESCRIPTIONS[String(equipmentType)] ||
    'n/a';

  return {
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
  };
}