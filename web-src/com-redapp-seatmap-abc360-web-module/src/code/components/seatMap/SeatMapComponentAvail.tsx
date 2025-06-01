// file: /code/components/seatMap/SeatMapComponentAvail.tsx

/**
 * SeatMapComponentAvail.tsx
 *
 * 🧭 Seat Map Viewer for Availability Scenario – RedApp ABC360
 *
 * This React component allows the user to view a seat map based on availability data.
 * It uses standardized components for selecting segments and cabin class,
 * and delegates rendering to SeatMapComponentBase.
 */

import * as React from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { getFlightFromSabreData } from './transformers/getFlightFromSabreData';
import SeatLegend from './panels/SeatLegend';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { normalizeSegment } from '../../utils/normalizeSegment';
import { SegmentCabinSelector } from './panels/SegmentCabinSelector';
import { mapCabinToCode } from '../../utils/mapCabinToCode';

interface SeatMapComponentAvailProps {
  config: any;
  data: any;
}

const SeatMapComponentAvail: React.FC<SeatMapComponentAvailProps> = ({ config, data }) => {
  const rawSegments = data.flightSegments || [];

  const availability = data.availability || [];

  const passengers = data.passengers || [];

  const [segmentIndex, setSegmentIndex] = React.useState(0);
  console.log('📦 rawSegment', rawSegments[segmentIndex]);

  const [cabinClass, setCabinClass] = React.useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  console.log('🔁 normalizeSegment called for rawSegments');

  const normalizedSegments = rawSegments.map(seg =>
    normalizeSegment(seg, { padFlightNumber: false })
  );

  const segment = normalizedSegments[segmentIndex];
  console.log('✅ normalizedSegment:', segment);

  console.log('🧪 normalized:', {
    origin: segment.origin,
    destination: segment.destination,
    departureDateTime: segment.departureDateTime,
    flightNumber: segment.flightNumber,
  });

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
    aircraftDescription
  } = segment;

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
        date={departureDateTime?.split?.('T')[0] || 'Unknown date'}
        duration={duration}
        aircraft={aircraftDescription}
      />
      <SeatLegend />
    </>
  );

  return (
    <div style={{ padding: '1rem' }}>
      <SegmentCabinSelector
        flightSegments={rawSegments}
        segmentIndex={segmentIndex}
        setSegmentIndex={(index) => {
          setSegmentIndex(index);
          setCabinClass('Y');
        }}
        cabinClass={cabinClass}
        setCabinClass={setCabinClass}
      />

      <SeatMapComponentBase
        config={config}
        flightSegments={normalizedSegments}
        initialSegmentIndex={segmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(segment, index) => {
          const mappedCabin = mapCabinToCode(cabinClass);
          return getFlightFromSabreData({
            flightSegments: [{
              ...segment,
              cabinClass: mappedCabin,
              equipment: segment.equipmentType,
            }]
          }, index);
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