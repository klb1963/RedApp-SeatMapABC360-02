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
import { useState, useEffect, useMemo } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import SeatLegend from './panels/SeatLegend';
import { t } from '../../Context';
import { normalizeSegment } from '../../utils/normalizeSegment';
import { SegmentCabinSelector } from './panels/SegmentCabinSelector';

interface SeatMapComponentShoppingProps {
  config: any;
  data: any;
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({ config, data }) => {
  const flightSegments = Array.isArray(data?.flightSegments) ? data.flightSegments : [];

  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');
  const [segmentIndex, setSegmentIndex] = useState(0);

  const normalized = useMemo(() => {
    return normalizeSegment(flightSegments[segmentIndex] || {}, { padFlightNumber: false });
  }, [flightSegments, segmentIndex]);

  const flightInfo = (
    <>
      <FlightInfoPanel
        airlineCode={normalized.marketingAirline}
        airlineName={normalized.marketingAirlineName || normalized.marketingAirline || 'n/a'}
        flightNumber={normalized.flightNumber}
        fromCode={normalized.origin}
        fromCity={normalized.originCityName || ''}
        toCode={normalized.destination}
        toCity={normalized.destinationCityName || ''}
        date={normalized.departureDateTime?.split?.('T')[0] || t('seatMap.dateUnknown')}
        duration={normalized.duration}
        aircraft={normalized.aircraftDescription}
      />
      <SeatLegend />
    </>
  );

  useEffect(() => {
    const enriched = flightSegments.map((seg: any) => {
      const n = normalizeSegment(seg);
      return {
        ...seg,
        marketingCarrier: n.marketingAirline,
        marketingAirlineName: n.marketingAirlineName,
        departureDateTime: n.departureDateTime,
        equipment: n.equipmentType,
        origin: n.origin,
        destination: n.destination,
        duration: n.duration
      };
    });

    sessionStorage.setItem('shoppingSegments', JSON.stringify(enriched));
    console.log('[🛍️ Shopping] Saved shoppingSegments to sessionStorage:', enriched);
  }, [flightSegments]);

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
        flightSegments={flightSegments}
        initialSegmentIndex={segmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(
            {
              ...segment,
              cabinClass,
              equipment: segment.equipmentType
            },
            index
          )
        }
        availability={[]} // пока не передаём
        passengers={[]}   // пока не передаём
        showSegmentSelector={false}
        flightInfo={flightInfo}
      />
    </div>
  );
};

export default SeatMapComponentShopping;