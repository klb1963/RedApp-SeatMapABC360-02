// file: utils/normalizeSegment.ts

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
  }

  export interface NormalizeSegmentOptions {
    padFlightNumber?: boolean;
  }
  
  export function normalizeSegment(
    seg: any,
    options: NormalizeSegmentOptions = {}
  ): NormalizedSegment {
    const {
      padFlightNumber = true
    } = options;
  
    const marketingAirline =
      seg.marketingCarrier ||
      seg.marketingAirline ||
      seg.MarketingAirline?.EncodeDecodeElement?.Code ||
      'XX';
  
    const marketingAirlineName =
      seg.marketingAirlineName ||
      seg.MarketingAirline?.EncodeDecodeElement?.SimplyDecoded ||
      '';
  
    const rawFlightNumber =
      seg.flightNumber || seg.marketingFlightNumber || seg.FlightNumber || '0';
  
      const flightNumber = padFlightNumber
      ? String(rawFlightNumber).padStart(4, '0')
      : String(Number(rawFlightNumber) || 0); // гарантирует удаление ведущих нулей
  
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
        : 'n/a';
  
    const equipment = seg.equipment || seg.Equipment || {};
  
    const equipmentType =
      typeof equipment === 'string'
        ? equipment
        : equipment.EquipmentType ||
          equipment.EncodeDecodeElement?.Code ||
          equipment.EncodeDecodeElement?.SimplyDecoded ||
          'n/a';
  
    const aircraftDescription =
      typeof equipment === 'string'
        ? EQUIPMENT_DESCRIPTIONS[equipment] || equipment
        : equipment.EncodeDecodeElement?.SimplyDecoded ||
          EQUIPMENT_DESCRIPTIONS[equipment.EquipmentType] ||
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