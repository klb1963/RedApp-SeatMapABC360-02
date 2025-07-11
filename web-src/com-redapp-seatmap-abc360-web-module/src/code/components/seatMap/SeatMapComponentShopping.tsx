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
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { t } from '../../Context';
import { normalizeSegment } from '../../utils/normalizeSegment';
import { SegmentCabinSelector } from './panels/SegmentCabinSelector';

interface SeatMapComponentShoppingProps {
  config: any;
  flightSegments: any[];
  selectedSegmentIndex: number;
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({
  config,
  flightSegments,
  selectedSegmentIndex,
}) => {
  const shoppingSegments = flightSegments;

  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  const rawSegment = shoppingSegments[segmentIndex] || {};

  // Безопасное нормализованное значение
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

  return (
    <div style={{ padding: '1rem' }}>
      <SegmentCabinSelector
        flightSegments={shoppingSegments}
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
        generateFlightData={(seg, index, cabin) =>
          generateFlightData({ ...normalized, cabinClass, equipment: normalized.equipmentType }, index)
        }
        availability={null}
        passengers={[]}
        showSegmentSelector={false}
        flightInfo={flightInfo}
      />
    </div>
  );
};

export default SeatMapComponentShopping;
