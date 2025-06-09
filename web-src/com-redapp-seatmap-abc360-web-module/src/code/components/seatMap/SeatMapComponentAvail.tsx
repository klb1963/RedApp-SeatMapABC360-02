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

  const [segmentIndex, setSegmentIndex] = React.useState(0);
  const [cabinClass, setCabinClass] = React.useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  // 👁 Только для отображения в UI
  const normalizedSegments = React.useMemo(() => {
    console.log('🔁 normalizeSegment called for rawSegments');
    return rawSegments.map((seg) =>
      normalizeSegment(seg, { padFlightNumber: false })
    );
  }, [rawSegments]);

  const segment = normalizedSegments[segmentIndex];
  const rawSegment = rawSegments[segmentIndex];

  // 🛫 Панель информации о рейсе
  const flightInfo = (
    <>
      <FlightInfoPanel
        airlineCode={segment.marketingAirline}
        airlineName={segment.marketingAirlineName}
        flightNumber={segment.flightNumber}
        fromCode={segment.origin}
        fromCity={segment.originCityName || ''}
        toCode={segment.destination}
        toCity={segment.destinationCityName || ''}
        date={segment.departureDateTime?.split?.('T')[0] || 'Unknown date'}
        duration={segment.duration}
        aircraft={segment.aircraftDescription}
      />
      <SeatLegend />
    </>
  );

  return (
    <div style={{ padding: '1rem' }}>
      {/* ✈️ Селектор сегмента и класса обслуживания */}
      <SegmentCabinSelector
        flightSegments={normalizedSegments}
        segmentIndex={segmentIndex}
        setSegmentIndex={(index) => {
          setSegmentIndex(index);
          setTimeout(() => setCabinClass('Y'), 0);
        }}
        cabinClass={cabinClass}
        setCabinClass={setCabinClass}
      />

      {/* 💺 Отображение карты мест */}
      <SeatMapComponentBase
        config={config}
        flightSegments={normalizedSegments} // только для отображения
        initialSegmentIndex={segmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(_, index, cabin) => {
          const rawSeg = rawSegments[index];

          if (!rawSeg) {
            console.warn('⚠️ rawSegment is missing for index:', index);
            return null;
          }

          // 🔍 Лог сегмента перед генерацией
          console.log('[🔁 SWITCH]', index, rawSeg);

          return getFlightFromSabreData(
            {
              flightSegments: [
                {
                  ...rawSeg,
                  cabinClass: mapCabinToCode(cabin),
                  equipment: rawSeg.equipmentType ?? rawSeg.aircraftType ?? 'n/a',
                },
              ],
            },
            0 // всегда индекс 0, потому что мы передаём массив из одного сегмента
          );
        }}
        availability={null}
        passengers={[]}
        showSegmentSelector={false}
        flightInfo={flightInfo}
      />
    </div>
  );
};

export default SeatMapComponentAvail;