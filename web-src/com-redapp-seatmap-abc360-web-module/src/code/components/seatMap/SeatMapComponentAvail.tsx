// file: SeatMapComponentAvail.tsx

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { getFlightFromSabreData } from './getFlightFromSabreData';

type CabinClassForLibrary = 'E' | 'P' | 'B' | 'F' | 'ALL';

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

  const enrichedSegment = {
    ...segment,
    cabinClass: cabinClass,
    equipment: segment.equipment
  };
  
  const flightInfo = (
    <div>
      <div><strong>{segment?.marketingAirline} {segment?.flightNumber}</strong></div>
      <div>{segment?.origin} → {segment?.destination}</div>
      <div>📅 Date: {segment?.departureDateTime?.split('T')[0] || 'not specified'}</div>
      <div>✈️ Equipment: {segment?.equipment || 'unknown'}</div>
      <div>💺 Class: {cabinClass || 'not specified'}</div>
      <hr />
      <div>
        <strong>Legend:</strong>
        <ul style={{ paddingLeft: '1rem' }}>
          <li>🟩 — available</li>
          <li>🟧 — available for a fee</li>
          <li>❌ — unavailable</li>
          <li>☑️ — occupied</li>
        </ul>
      </div>
    </div>
  );


  return (
    <div style={{ padding: '1rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

      <div>
        <label>Сегмент:</label>
        <select value={segmentIndex} onChange={handleSegmentChange}>
          {normalizedSegments.map((seg: any, idx: number) => (
            <option key={idx} value={idx}>
              {seg.origin} → {seg.destination}, рейс {seg.flightNumber}
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
        <option value="ALL">All Cabins</option>
      </select>

      <br /><br />

      <SeatMapComponentBase
          config={config}
          flightSegments={[normalizedSegments[segmentIndex]]}
          initialSegmentIndex={0}
          cabinClass={cabinClass}
          generateFlightData={() => {
            const enrichedSegment = {
              ...segment,
              cabinClass: cabinClass === 'ALL' ? undefined : cabinClass,
              equipment: segment.equipment
            };
            return getFlightFromSabreData({ flightSegments: [enrichedSegment] }, 0);
          }}
          availability={availability}
          passengers={passengers}
          showSegmentSelector={false}
          flightInfo={flightInfo}
      />
    </div>
  );
};

export default SeatMapComponentAvail;