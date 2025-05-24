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
    duration: string;                 // Пример: "6h 0m"
    equipmentType: string;            // Пример: "388"
    aircraftDescription: string;      // Пример: "AIRBUS A380"
  }
  
  export function normalizeSegment(seg: any): NormalizedSegment {
    const marketingAirline =
      seg.marketingCarrier ||
      seg.MarketingAirline?.EncodeDecodeElement?.Code ||
      'XX';
  
    const marketingAirlineName =
      seg.MarketingAirline?.EncodeDecodeElement?.SimplyDecoded || '';
  
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


    // 🔁 Duration (в минутах, извлекается либо как число, либо из ElapsedTime)
    const rawDuration = seg.duration ?? seg.ElapsedTime;
    const durationMinutes = typeof rawDuration === 'number' ? rawDuration : parseInt(rawDuration || '', 10) || 0;

    const duration =
        durationMinutes > 0
            ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
            : 'n/a';

    const equipment =
        seg.equipment ||
        seg.Equipment ||
        {};
  
    const equipmentType =
      typeof equipment === 'string'
        ? equipment
        : equipment.EquipmentType ||
          equipment.EncodeDecodeElement?.Code ||
          '—';
  
    const aircraftDescription =
      typeof equipment === 'string'
        ? equipment
        : equipment.EncodeDecodeElement?.SimplyDecoded || 'n/a';
  
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