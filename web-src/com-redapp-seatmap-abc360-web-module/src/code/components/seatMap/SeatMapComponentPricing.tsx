// file: /code/components/seatMap/SeatMapComponentPricing.tsx

/**
 * SeatMapComponentPricing.tsx
 * 
 * 💺 SeatMap Viewer for Pricing Scenario – RedApp ABC360
 * 
 * Displays a static SeatMap in the context of a pricing workflow.
 * Allows the agent to select the cabin class (Economy, Business, etc.)
 * and view the aircraft layout without availability or passenger data.
 * 
 * This component wraps SeatMapComponentBase and provides:
 * - Basic segment info
 * - Cabin class selection dropdown
 * - Static flight info header
 * - Visual seat map (no availability, no interactivity)
 */

import * as React from 'react';
import { useState } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import SeatLegend from './panels/SeatLegend';

interface SeatMapComponentPricingProps {
  config: any;
  flightSegments: any[];
  selectedSegmentIndex: number;
}

const SeatMapComponentPricing: React.FC<SeatMapComponentPricingProps> = ({
  config,
  flightSegments,
  selectedSegmentIndex
}) => {
  // 🔁 Cabin class selection (defaults to Economy)
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  // 📦 Extract selected segment
  const segment = flightSegments[selectedSegmentIndex];

  // ✈️ Normalize equipment name
  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'неизвестно';

  // 📅 Format departure date
  const departureDate = segment?.departureDate?.toISOString().split('T')[0] || 'not specified';

  // 🧩 Compose header info block (above map)
  const flightInfo = segment && (
    <div>
      <strong>Flight info:</strong>
      <div>{segment.origin} → {segment.destination}</div>
      <div>Date: {departureDate}</div>
      <div>Equipment: {equipment}</div>
      <div>Class: {cabinClass}</div>
      <div style={{ marginTop: '1rem' }}>
        <SeatLegend />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '1rem' }}>
      {/* 🔝 Segment info header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <label style={{ marginRight: '0.5rem' }}>Сегмент:</label>
          <span>
            {segment?.origin} → {segment?.destination}, рейс {segment?.flightNumber}
          </span>
        </div>
        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          ✈️ <strong>Equipment:</strong> {equipment}
        </div>
      </div>

      {/* 👔 Cabin class selector */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Класс обслуживания:</label>
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

      {/* 📌 Render seat map with selected cabin class */}
      <SeatMapComponentBase
        config={config}
        flightSegments={flightSegments}
        initialSegmentIndex={selectedSegmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(
            { ...segment, cabinClass: cabin, equipment: segment.equipment },
            index
          )
        }
        availability={[]} // no dynamic seat data
        passengers={[]}   // no passengers in Pricing mode
        showSegmentSelector={false}
        flightInfo={flightInfo} // header info + legend
      />
    </div>
  );
};

export default SeatMapComponentPricing;