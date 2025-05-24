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
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { t } from '../../Context';
import { normalizeSegment } from '../../utils/normalizeSegment';

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

  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  const rawSegment = shoppingSegments[segmentIndex] || {};
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

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Segment selector */}
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
            {shoppingSegments.map((seg: any, idx: number) => {
              const s = normalizeSegment(seg, { padFlightNumber: false });
              return (
                <option key={idx} value={idx}>
                  {s.origin} → {s.destination}, {s.flightNumber}
                </option>
              );
            })}
          </select>
          <div
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              fontSize: '1.5rem',
              color: '#234E55',
            }}
          >
            ▼
          </div>
        </div>

        {/* Equipment display */}
        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          <strong>Equipment:</strong> {equipmentType}
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
            ▼
          </div>
        </div>
      </div>

      <SeatMapComponentBase
        config={config}
        flightSegments={[normalized]}
        initialSegmentIndex={0}
        cabinClass={cabinClass}
        generateFlightData={(seg, index, cabin) =>
          generateFlightData({ ...normalized, cabinClass, equipment: normalized.equipmentType }, index)
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