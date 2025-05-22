// file: /code/components/seatMap/SeatMapComponentShopping.tsx

/**
 * SeatMapComponentShopping.tsx
 * 
 * 🛍️ SeatMap Viewer for Shopping Scenario – RedApp ABC360
 * 
 * Displays a seat map based on flight data during the fare shopping stage.
 * Allows selection of a flight segment and service class to preview cabin layout.
 * No passengers or seat availability are shown at this stage.
 * 
 * Wraps the reusable <SeatMapComponentBase /> and feeds it appropriate input.
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import SeatLegend from './panels/SeatLegend';
import { t } from '../../Context';

interface SeatMapComponentShoppingProps {
  config: any;
  data: any;
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({ config, data }) => {
  const flightSegments = Array.isArray(data?.flightSegments) ? data.flightSegments : [];

  // console.log('[🛍️ SHOPPING] Raw flightSegments:', data?.flightSegments);

  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');
  const [segmentIndex, setSegmentIndex] = useState(0);

  // Unpak data
  const currentSegmentRaw = flightSegments[segmentIndex] || {};

  // 📌 Normalized data 
  const airlineName =
  currentSegmentRaw.marketingCarrier ||
  currentSegmentRaw.marketingAirline?.EncodeDecodeElement?.Code ||
  currentSegmentRaw.marketingAirline ||
  'n/a';
  const flightNumber = currentSegmentRaw.flightNumber || currentSegmentRaw.FlightNumber || '—';
  const fromCode = currentSegmentRaw.origin || currentSegmentRaw.OriginLocation?.EncodeDecodeElement?.Code || '—';
  const toCode = currentSegmentRaw.destination || currentSegmentRaw.DestinationLocation?.EncodeDecodeElement?.Code || '—';
  const fromCity = ''; // городов нет в Shopping
  const toCity = '';
  const date = currentSegmentRaw.departureDateTime?.split?.('T')[0] || currentSegmentRaw.DepartureDateTime?.split?.('T')[0] || 'not specified';
  const duration = currentSegmentRaw.duration || 'n/a';
  const equipmentType = typeof currentSegmentRaw.equipment === 'object'
    ? currentSegmentRaw.equipment?.EquipmentType || '—'
    : '—';
  const aircraftDescription = typeof currentSegmentRaw.equipment === 'object'
    ? currentSegmentRaw.equipment?.EncodeDecodeElement?.SimplyDecoded || t('seatMap.unknown')
    : t('seatMap.unknown');

  // 🧾 Segment info
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
        equipmentType={equipmentType}
        aircraft={aircraftDescription}
      />
      <SeatLegend />
    </>
  );

  // 💾 Save enriched segments to sessionStorage for use in Pricing
  useEffect(() => {
    const enriched = flightSegments.map((seg: any) => ({
      ...seg,
      marketingCarrier: seg.marketingAirline || seg.marketingCarrier || 'n/a',
      departureDateTime: seg.departureDate || seg.departureDateTime || '',
      equipment:
        typeof seg.equipment === 'object'
          ? seg.equipment?.EncodeDecodeElement?.SimplyDecoded
          : seg.equipment || '',
      origin: seg.origin || seg.OriginLocation?.EncodeDecodeElement?.Code || 'n/a',
      destination: seg.destination || seg.DestinationLocation?.EncodeDecodeElement?.Code || 'n/a',
    }));

    sessionStorage.setItem('shoppingSegments', JSON.stringify(enriched));
    console.log('[🛍️ Shopping] Saved shoppingSegments to sessionStorage:', enriched);
  }, [flightSegments]);

  return (
    <div style={{ padding: '1rem' }}>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        {/* Segment */}
        <div style={{ position: 'relative' }}>
          <label style={{ marginRight: '0.5rem' }}>Segment:</label>
          <select
            value={segmentIndex}
            onChange={(e) => setSegmentIndex(Number(e.target.value))}
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
            {flightSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin || '???'} → {seg.destination || '???'}, {seg.flightNumber || '---'}
              </option>
            ))}
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

        {/* Equipment */}
        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          <strong>Equipment type:</strong> {equipmentType}
        </div>
      </div>

      {/* Cabin class selector */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Cabin class:</label>

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={cabinClass}
            onChange={(e) => setCabinClass(e.target.value as 'Y' | 'S' | 'C' | 'F' | 'A')}
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
          <div
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              fontSize: '1.5rem',
              color: '#234E55',
            }}
          >

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

      <SeatMapComponentBase
        config={config}
        flightSegments={flightSegments}
        initialSegmentIndex={segmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(
            {
              ...segment,
              cabinClass: cabin,
              equipment: segment.equipment,
            },
            index
          )
        }
        availability={[]}
        passengers={[]}
        showSegmentSelector={false}
        flightInfo={flightInfo}
      />
    </div>
  );
};

export default SeatMapComponentShopping;