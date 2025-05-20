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
import { useState } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import SeatLegend from './panels/SeatLegend';

interface SeatMapComponentShoppingProps {
  config: any;
  data: any;
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({ config, data }) => {
  const flightSegments = Array.isArray(data?.flightSegments) ? data.flightSegments : [];

  // console.log('[🛍️ SHOPPING] Raw flightSegments:', data?.flightSegments);

  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');
  const [segmentIndex, setSegmentIndex] = useState(0);

  // Uppak data
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
  const equipment =
    typeof currentSegmentRaw.equipment === 'object'
      ? currentSegmentRaw.equipment?.EncodeDecodeElement?.SimplyDecoded
      : currentSegmentRaw.Equipment?.EncodeDecodeElement?.SimplyDecoded || currentSegmentRaw.equipment || 'n/a';

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
        equipment={equipment}
      />
      <SeatLegend />
    </>
  );

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Segment:</label>
          <select
            value={segmentIndex}
            onChange={(e) => setSegmentIndex(Number(e.target.value))}
          >
            {flightSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin || '???'} → {seg.destination || '???'}, Flight {seg.flightNumber || '---'}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          <strong>Aircraft:</strong> {equipment}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Cabin class:</label>
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value as 'Y' | 'S' | 'C' | 'F' | 'A')}
        >
          <option value="Y">Economy</option>
          <option value="S">Premium Economy</option>
          <option value="C">Business</option>
          <option value="F">First</option>
          <option value="A">All Cabins</option>
        </select>
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