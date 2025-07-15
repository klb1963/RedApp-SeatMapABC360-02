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
import { SegmentCabinSelector } from './panels/SegmentCabinSelector';

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
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  const rawSegment = flightSegments?.[segmentIndex];

  const normalized = React.useMemo(() => {
    if (!rawSegment || typeof rawSegment !== 'object') {
      console.warn('⚠️ rawSegment is invalid or undefined:', rawSegment);
      return null;
    }
    return normalizeSegment(rawSegment, { padFlightNumber: false });
  }, [rawSegment]);

  if (!normalized) {
    return <div style={{ padding: '1rem', color: 'red' }}>Segment data is unavailable.</div>;
  }

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
        aircraft={aircraftDescription}
      />
      <SeatLegend />
    </>
  );

  // ✅ Precompute flightData once
  const flightData = generateFlightData(
    { ...normalized, cabinClass, equipment: normalized.equipmentType },
    0,
    cabinClass
  );

  return (
    <div style={{ padding: '1rem' }}>
      <SegmentCabinSelector
        flightSegments={flightSegments}
        segmentIndex={segmentIndex}
        setSegmentIndex={setSegmentIndex}
        cabinClass={cabinClass}
        setCabinClass={setCabinClass}
      />

      <SeatMapComponentBase
        config={config}
        flightSegments={[normalized]}
        segmentIndex={0}
        cabinClass={cabinClass}
        flightData={flightData}
        availability={null}
        passengers={[]}
        showSegmentSelector={false}
        flightInfo={flightInfo}
        allSelectedSeats={[]}
      />
    </div>
  );
};

export default SeatMapComponentPricing;