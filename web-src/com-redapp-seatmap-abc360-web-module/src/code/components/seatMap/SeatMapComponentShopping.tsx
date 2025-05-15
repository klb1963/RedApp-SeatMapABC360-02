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
import SeatLegend from './panels/SeatLegend';

interface SeatMapComponentShoppingProps {
  config: any;
  data: any;
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({ config, data }) => {
  // 📦 Safely extract the list of flight segments
  const flightSegments = Array.isArray(data?.flightSegments) ? data.flightSegments : [];

  // 🎚️ Manage selected cabin class and flight segment
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');
  const [segmentIndex, setSegmentIndex] = useState(0);

  // 📌 Currently selected segment
  const currentSegment = flightSegments[segmentIndex] || {};

  // ✈️ Normalize equipment name for readability
  const equipment =
    typeof currentSegment.equipment === 'object'
      ? currentSegment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : currentSegment.equipment || 'Unknown';

  return (
    <div style={{ padding: '1rem' }}>
      {/* 🔁 Segment selector and aircraft type display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
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

        {/* ✈️ Aircraft information */}
        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          ✈️ <strong>Aircraft:</strong> {equipment}
        </div>
      </div>

      {/* 👔 Cabin class selector */}
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

      {/* 🧩 Seat map rendering */}
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
        availability={[]}     // 👥 No seat availability data in the Shopping step
        passengers={[]}       // 👤 No passengers yet (PNR not created)
        showSegmentSelector={false}
        flightInfo={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Flight info:</strong>
              <div>{currentSegment.origin} → {currentSegment.destination}</div>
              <div>Date: {currentSegment.departureDateTime || 'not specified'}</div>
              <div>Equipment: {currentSegment.equipment?.EncodeDecodeElement?.SimplyDecoded || 'Unknown'}</div>
              <div>Class: {cabinClass}</div>
            </div>
            <SeatLegend />
          </div>
        }
      />
    </div>
  );
};

export default SeatMapComponentShopping;