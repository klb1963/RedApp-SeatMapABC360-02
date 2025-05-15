// file: /code/components/seatMap/SeatMapComponentAvail.tsx

/**
 * SeatMapComponentAvail.tsx
 *
 * 🧭 Seat Map Viewer for Availability Scenario – RedApp ABC360
 *
 * This React component allows the user to view a seat map based on availability data.
 * It provides a segment selector and a cabin class selector, then renders a visual SeatMap using
 * SeatMapComponentBase. Segments and input data are normalized for compatibility with the rendering library.
 */

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { getFlightFromSabreData } from './transformers/getFlightFromSabreData';
import SeatLegend from './panels/SeatLegend';

type CabinClassForLibrary = 'E' | 'P' | 'B' | 'F' | 'ALL';

interface SeatMapComponentAvailProps {
  config: any; // Configuration for the SeatMap rendering library
  data: any;   // Raw input data including flightSegments, availability, and passengers
}

const SeatMapComponentAvail: React.FC<SeatMapComponentAvailProps> = ({ config, data }) => {
  // Extract raw data from props
  const rawSegments = data.flightSegments || [];
  const availability = data.availability || [];
  const passengers = data.passengers || [];

  // State for selected flight segment and selected cabin class
  const [segmentIndex, setSegmentIndex] = React.useState(0);
  const [cabinClass, setCabinClass] = React.useState<CabinClassForLibrary>('E');

  // Normalize raw segment data into a consistent format
  const normalizedSegments = rawSegments.map((seg: any) => ({
    marketingAirline: seg.marketingCarrier || seg.MarketingAirline?.EncodeDecodeElement?.Code || 'XX',
    flightNumber: seg.marketingFlightNumber || seg.FlightNumber || '000',
    departureDateTime: seg.departureDate || seg.DepartureDateTime || '',
    origin: seg.origin || seg.OriginLocation?.EncodeDecodeElement?.Code || '???',
    destination: seg.destination || seg.DestinationLocation?.EncodeDecodeElement?.Code || '???',
    equipment: seg.Equipment?.EncodeDecodeElement?.SimplyDecoded || seg.equipment || ''
  }));

  // Handler when segment is changed via dropdown
  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSegmentIndex(Number(e.target.value));
    setCabinClass('E'); // reset cabin class when switching segment
  };

  const segment = normalizedSegments[segmentIndex];
  console.log('📡 Segment before generateFlightData:', segment);

  // Enriched segment with cabin info to feed into the seat map
  const enrichedSegment = {
    ...segment,
    cabinClass: cabinClass,
    equipment: segment.equipment
  };

  // Info block displayed above the seat map
  const flightInfo = (
    <div>
      <div><strong>{segment?.marketingAirline} {segment?.flightNumber}</strong></div>
      <div>{segment?.origin} → {segment?.destination}</div>
      <div>📅 Date: {segment?.departureDateTime?.split('T')[0] || 'not specified'}</div>
      <div>✈️ Equipment: {segment?.equipment || 'unknown'}</div>
      <div>💺 Class: {cabinClass || 'not specified'}</div>
      <hr />
      <SeatLegend />
    </div>
  );

  return (
    <div style={{ padding: '1rem' }}>
      {/* Segment selector */}
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

        {/* Display aircraft type */}
        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          ✈️ <strong>Самолёт:</strong> {normalizedSegments?.[segmentIndex]?.equipment || 'неизвестно'}
        </div>
      </div>

      <br />

      {/* Cabin class selector */}
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

      {/* Render SeatMap with selected data */}
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