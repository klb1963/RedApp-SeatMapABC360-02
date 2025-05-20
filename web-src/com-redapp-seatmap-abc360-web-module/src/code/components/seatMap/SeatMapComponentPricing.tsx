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
import { useState, useEffect } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import SeatLegend from './panels/SeatLegend';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';

interface SeatMapComponentPricingProps {
  config: any;
  flightSegments: any[];
  selectedSegmentIndex: number;
}

const SeatMapComponentPricing: React.FC<SeatMapComponentPricingProps> = ({
  config,
  flightSegments,
  selectedSegmentIndex,
}) => {
  const shoppingSegments = JSON.parse(sessionStorage.getItem('shoppingSegments') || '[]');

  // 🔁 Segment index (default — from props)
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  const segment = shoppingSegments[segmentIndex] || {};

  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'Not Available';

  const airlineName = segment?.marketingAirline || 'n/a';
  const flightNumber = segment?.flightNumber || '—';
  const fromCode = segment?.origin || '—';
  const toCode = segment?.destination || '—';
  const departureDate =
    segment?.departureDateTime?.split?.('T')[0] || segment?.departureDate || 'not specified';
  const duration = segment?.ElapsedTime
    ? `${Math.floor(segment.ElapsedTime / 60)}:${String(segment.ElapsedTime % 60).padStart(2, '0')}`
    : 'n/a';

  const flightInfo = (
    <>
      <FlightInfoPanel
        airlineName={airlineName}
        flightNumber={flightNumber}
        fromCode={fromCode}
        fromCity=""
        toCode={toCode}
        toCity=""
        date={departureDate}
        duration={duration}
        equipment={equipment}
      />
      <SeatLegend />
    </>
  );

  return (
    <div style={{ padding: '1rem' }}>
      {/* 🔝 Segment info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label style={{ marginRight: '0.5rem' }}>Segment:</label>
          <select
            value={segmentIndex}
            onChange={(e) => setSegmentIndex(Number(e.target.value))}
          >
            {shoppingSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin} → {seg.destination}, Flight {seg.flightNumber}
              </option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          <strong>Equipment:</strong> {equipment}
        </div>
      </div>

      {/* 🎫 Cabin class */}
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

      {/* 🗺️ Seat Map */}
      <SeatMapComponentBase
        config={config}
        flightSegments={shoppingSegments}
        initialSegmentIndex={segmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(seg, index, cabin) =>
          generateFlightData({ ...seg, cabinClass: cabin, equipment: seg.equipment }, index)
        }
        availability={[]}
        passengers={[]}
        showSegmentSelector={false}
        flightInfo={flightInfo}
      />
    </div>
  );
};

export default SeatMapComponentPricing;