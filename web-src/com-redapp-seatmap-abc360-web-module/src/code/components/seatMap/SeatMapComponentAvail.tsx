// file: SeatMapComponentAvail.tsx

// Финализированный компонент SeatMapComponentAvail

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { getFlightFromSabreData } from './getFlightFromSabreData';

type CabinClassForLibrary = 'E' | 'P' | 'B' | 'F';

interface SeatMapComponentAvailProps {
  config: any;
  data: any;
}

const SeatMapComponentAvail: React.FC<SeatMapComponentAvailProps> = ({ config, data }) => {
  const rawSegments = data.flightSegments || [];
  const availability = data.availability || [];
  const passengers = data.passengers || [];

  const [segmentIndex, setSegmentIndex] = React.useState(0);
  const [cabinClass, setCabinClass] = React.useState<CabinClassForLibrary>('E');

  const normalizedSegments = rawSegments.map((seg: any) => ({
    marketingAirline: seg.marketingCarrier || seg.MarketingAirline?.EncodeDecodeElement?.Code || 'XX',
    flightNumber: seg.marketingFlightNumber || seg.FlightNumber || '000',
    departureDateTime: seg.departureDate || seg.DepartureDateTime || '',
    origin: seg.origin || seg.OriginLocation?.EncodeDecodeElement?.Code || '???',
    destination: seg.destination || seg.DestinationLocation?.EncodeDecodeElement?.Code || '???',
    equipment: seg.Equipment?.EncodeDecodeElement?.SimplyDecoded || seg.equipment || ''
  }));

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSegmentIndex(Number(e.target.value));
    setCabinClass('E');
  };

  const segment = normalizedSegments[segmentIndex];
  console.log('📡 Segment before generateFlightData:', segment);

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div>
          <label>Сегмент:</label>
          <select value={segmentIndex} onChange={handleSegmentChange}>
            {rawSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin} → {seg.destination}, рейс {seg.FlightNumber || seg.marketingFlightNumber}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          ✈️ <strong>Самолёт:</strong> {normalizedSegments?.[segmentIndex]?.equipment || 'неизвестно'}
        </div>
      </div>

      <br />

      <label>Класс обслуживания:</label>
      <select
        value={cabinClass}
        onChange={(e) => setCabinClass(e.target.value as CabinClassForLibrary)}
      >
        <option value="E">Economy</option>
        <option value="P">Premium Economy</option>
        <option value="B">Business</option>
        <option value="F">First</option>
      </select>

      <br /><br />

      <SeatMapComponentBase
        config={config}
        flightSegments={[segment]}
        initialSegmentIndex={0}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) => {
          const enrichedSegment = {
            ...segment,
            cabinClass: cabin,
            equipment: segment.equipment
          };
          console.log('🛫 enrichedSegment for generateFlightData:', enrichedSegment);
          return getFlightFromSabreData({ flightSegments: [enrichedSegment] }, 0);
        }}
        availability={availability}
        passengers={passengers}
        showSegmentSelector={false}
      />
    </div>
  );
};

export default SeatMapComponentAvail;