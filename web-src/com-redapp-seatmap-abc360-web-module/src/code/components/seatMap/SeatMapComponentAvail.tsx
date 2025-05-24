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
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { t } from '../../Context';
import { normalizeSegment } from '../../utils/normalizeSegment';

type CabinClassForLibrary = 'E' | 'P' | 'B' | 'F' | 'ALL';

interface SeatMapComponentAvailProps {
  config: any;
  data: any;
}

const SeatMapComponentAvail: React.FC<SeatMapComponentAvailProps> = ({ config, data }) => {
  const rawSegments = data.flightSegments || [];
  console.log('📦 Raw segments from props:', rawSegments);

  const availability = data.availability || [];
  const passengers = data.passengers || [];

  const [segmentIndex, setSegmentIndex] = React.useState(0);
  const [cabinClass, setCabinClass] = React.useState<CabinClassForLibrary>('E');

  const rawSegment = rawSegments[segmentIndex];
  console.log('📦 [Availability] rawSegment:', rawSegment);
  console.log('[🧪 Check rawSegment.duration]', rawSegment.duration, '| ElapsedTime:', rawSegment.ElapsedTime);

  const normalized = normalizeSegment(rawSegment, { padFlightNumber: false });

  const {
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
  } = normalized;

  const flightInfo = (
    <>
      <FlightInfoPanel
        airlineCode={marketingAirline}
        airlineName={marketingAirlineName}
        flightNumber={flightNumber}
        fromCode={origin}
        fromCity={originCityName || ''}
        toCode={destination}
        toCity={destinationCityName || ''}
        date={departureDateTime?.split?.('T')[0] || t('seatMap.dateUnknown')}
        duration={duration}
        equipmentType={equipmentType}
        aircraft={aircraftDescription}
      />
      <SeatLegend />
    </>
  );

  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSegmentIndex(Number(e.target.value));
    setCabinClass('E');
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        <div style={{ position: 'relative' }}>
          <label style={{ marginRight: '0.5rem' }}>Segment:</label>
          <select
            value={segmentIndex}
            onChange={handleSegmentChange}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '1.5rem',
              padding: '0.25rem 1.5rem 0.25rem 0.5rem',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '200px',
            }}
          >
            {rawSegments.map((seg: any, idx: number) => {
              const s = normalizeSegment(seg, { padFlightNumber: false });
              return (
                <option key={idx} value={idx}>
                  {s.origin} → {s.destination}, {s.flightNumber}
                </option>
              );
            })}
          </select>
          {/* ▼ */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#234E55'
            }}
          >
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
  
        <div>
          <span style={{ color: '#555', fontSize: '1.5rem' }}>
            <strong>Equipment type:</strong> {equipmentType}
          </span>
        </div>
      </div>
  
      <div style={{ position: 'relative', display: 'inline-block', marginTop: '0rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Cabin class:</label>
        <select
          value={cabinClass ?? 'A'}
          onChange={(e) => {
            const value = e.target.value;
            setCabinClass(value === 'A' ? undefined : (value as CabinClassForLibrary));
          }}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '1.5rem',
            padding: '0.25rem 2rem 0.25rem 0.5rem',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '180px',
          }}
        >
          <option value="Y">Economy</option>
          <option value="S">Premium Economy</option>
          <option value="C">Business</option>
          <option value="F">First</option>
          <option value="A">All Cabins</option>
        </select>
        {/* ▼ */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#234E55'
          }}
        >
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
  
      <br />
  
      <SeatMapComponentBase
        config={config}
        flightSegments={[normalized]}
        initialSegmentIndex={0}
        cabinClass={cabinClass}
        generateFlightData={() => {
          return getFlightFromSabreData({
            flightSegments: [{
              ...normalized,
              cabinClass,
              equipment: normalized.equipmentType
            }]
          }, 0);
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