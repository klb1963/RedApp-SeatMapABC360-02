// file: utils/normalizeSegment.ts

export interface NormalizedSegment {
    marketingAirline: string;         // LH
    marketingAirlineName: string;     // Lufthansa
    flightNumber: string;
    departureDateTime: string;
    origin: string;
    originCityName: string;
    destination: string;
    destinationCityName: string;
    duration: string;                 // Пример: "1h 15m"
    equipmentType: string;            // Пример: "321"
    aircraftDescription: string;      // Пример: "AIRBUS A321"
  }
  
  export function normalizeSegment(seg: any): NormalizedSegment {
    const marketingAirline =
      seg.marketingCarrier ||
      seg.MarketingAirline?.EncodeDecodeElement?.Code ||
      'XX';
  
    const marketingAirlineName =
      seg.MarketingAirline?.EncodeDecodeElement?.SimplyDecoded ||
      '';
  
    const flightNumber =
      seg.flightNumber ||
      seg.marketingFlightNumber ||
      seg.FlightNumber ||
      '000';
  
    const departureDateTime =
      seg.departureDateTime ||
      seg.departureDate ||
      seg.DepartureDateTime ||
      '';
  
    const origin =
      seg.origin ||
      seg.OriginLocation?.EncodeDecodeElement?.Code ||
      '???';
  
    const originCityName =
      seg.originCityName ||
      seg.OriginLocation?.cityName ||
      '';
  
    const destination =
      seg.destination ||
      seg.DestinationLocation?.EncodeDecodeElement?.Code ||
      '???';
  
    const destinationCityName =
      seg.destinationCityName ||
      seg.DestinationLocation?.cityName ||
      '';
  
    const durationMinutes = seg.ElapsedTime || seg.duration || 0;
    let duration = '';
    if (durationMinutes > 0) {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      duration =
        (hours ? `${hours}h` : '') +
        (hours && minutes ? ' ' : '') +
        (minutes ? `${minutes}m` : '');
    }
  
    const equipment =
      seg.equipment ||
      seg.Equipment ||
      {};
  
    const equipmentType =
      equipment.EquipmentType ||
      equipment.EncodeDecodeElement?.Code ||
      '—';
  
    const aircraftDescription =
      equipment.EncodeDecodeElement?.SimplyDecoded ||
      'Unknown aircraft';
  
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
      aircraftDescription
    };
  }