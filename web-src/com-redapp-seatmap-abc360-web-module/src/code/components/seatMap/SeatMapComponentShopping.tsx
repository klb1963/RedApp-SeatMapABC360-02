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

interface SeatMapComponentShoppingProps {
  config: any;
  data: any;
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({ config, data }) => {
  const flightSegments = Array.isArray(data?.flightSegments) ? data.flightSegments : [];

  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');
  const [segmentIndex, setSegmentIndex] = useState(0);

  // ✅ Используем useMemo для перерасчета normalized при смене сегмента
  const normalized = useMemo(() => {
    return normalizeSegment(flightSegments[segmentIndex] || {}, { padFlightNumber: false });
  }, [flightSegments, segmentIndex]);

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

  console.log('🛍️ Shopping received data:', data);
  console.log('🛍️ Shopping flightSegments:', flightSegments);
  console.log('🛍️ Shopping normalized:', normalized);

  // ✅ Логирование enriched и сохранение сегментов в sessionStorage
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
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
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
            {flightSegments.map((seg: any, idx: number) => {
              const s = normalizeSegment(seg, { padFlightNumber: false });
              return (
                <option key={idx} value={idx}>
                  {s.origin} → {s.destination}, {s.flightNumber}
                </option>
              );
            })}
          </select>

          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#234E55'
            }}
          >
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          <strong>Equipment type:</strong> {equipmentType}
        </div>
      </div>

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
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#234E55'
              }}
            >
              <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <SeatMapComponentBase
        config={config}
        flightSegments={[normalized]}
        initialSegmentIndex={0}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(
            {
              ...normalized,
              cabinClass,
              equipment: normalized.equipmentType
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