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
import {useMemo } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { getFlightFromSabreData } from './transformers/getFlightFromSabreData';
import SeatLegend from './panels/SeatLegend';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';

type CabinClassForLibrary = 'E' | 'P' | 'B' | 'F' | 'ALL';

interface SeatMapComponentAvailProps {
  config: any; // Configuration for the SeatMap rendering library
  data: any;   // Raw input data including flightSegments, availability, and passengers
}

const SeatMapComponentAvail: React.FC<SeatMapComponentAvailProps> = ({ config, data }) => {
  // Extract raw data from props
  const rawSegments = data.flightSegments || [];
  console.log('📦 Raw segments from props:', rawSegments); // 👈 вот сюда

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
    equipment: seg.Equipment?.EncodeDecodeElement?.SimplyDecoded || seg.equipment || '',
    duration: seg.ElapsedTime ? `${Math.floor(seg.ElapsedTime / 60)}:${String(seg.ElapsedTime % 60).padStart(2, '0')}` : ''
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
  const airlineName = segment.marketingAirline || '—';
  const flightNumber = segment.flightNumber || '—';
  const fromCode = segment.origin || '—';
  const fromCity = ''; // в availability обычно городов нет
  const toCode = segment.destination || '—';
  const toCity = '';
  const date = segment.departureDateTime?.split?.('T')[0] || 'not specified';
  const duration = segment.duration || '';
  const equipmentText = segment.equipment || 'unknown';
  
  const flightInfo = (
    <>
      <FlightInfoPanel
        airlineName={airlineName}
        flightNumber={flightNumber}
        fromCode={fromCode}
        fromCity={fromCity}
        toCode={toCode}
        toCity={toCity}
        date={date}
        duration={duration}
        equipment={equipmentText}
      />
      <SeatLegend />
    </>
  );

  return (
    <div style={{ padding: '1rem' }}>
  
      {/* Segment selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
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
            {normalizedSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin} → {seg.destination}, {seg.flightNumber}
              </option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: '1.5rem',
            color: '#234E55',
          }}>
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
        </div>
  
        {/* Equipment */}
        <div>
          <span style={{ color: '#555', fontSize: '1.5rem' }}>
            <strong>Equipment type:</strong> {segment?.equipment}
          </span>
        </div>
      </div>
  
      {/* Cabin class selector */}
      <div style={{ position: 'relative', display: 'inline-block', marginTop: '0rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Cabin class:</label>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={cabinClass ?? 'A'}
            onChange={(e) => {
              const value = e.target.value;
              setCabinClass(value === 'A' ? undefined : value as CabinClassForLibrary);
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
          <div style={{
            position: 'absolute',
            right: '6px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: '1.5rem',
            color: '#234E55',
          }}>
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
        </div>
      </div>

      <br />
  
      {/* Seat Map */}
      <SeatMapComponentBase
        config={config}
        flightSegments={[normalizedSegments[segmentIndex]]}
        initialSegmentIndex={0}
        cabinClass={cabinClass}
        generateFlightData={() => {
          const seg = normalizedSegments[segmentIndex];
          return getFlightFromSabreData({
            flightSegments: [{
              ...seg,
              cabinClass,
              equipment: seg.equipment
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