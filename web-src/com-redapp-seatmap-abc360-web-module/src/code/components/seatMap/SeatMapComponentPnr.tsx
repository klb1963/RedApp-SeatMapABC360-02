// file: /code/components/seatMap/SeatMapComponentPnr.tsx

/**
 * SeatMapComponentPnr.tsx
 *
 * This component is used to render the seat map interface in the PNR context.
 * It allows the user to:
 * - Select a flight segment
 * - Choose a cabin class (Economy, Business, etc.)
 * - View flight details and equipment info
 * - Interact with the seat map to assign seats to selected passengers
 *
 * Internally it uses the SeatMapComponentBase to render the seat map via iframe
 * and provides all necessary props (segment, availability, passengers, etc.).
 */

import * as React from 'react';
import { useState } from 'react';
import SeatMapComponentBase, { SelectedSeat } from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import SeatLegend from './panels/SeatLegend';
import { PassengerOption } from '../../utils/parcePnrData';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { normalizeSegment } from '../../utils/normalizeSegment';
import { t } from '../../Context';

interface SeatMapComponentPnrProps {
  config: any;
  flightSegments: any[];
  selectedSegmentIndex?: number;
  availability?: any[];
  passengers?: PassengerOption[];
  showSegmentSelector?: boolean;
  onSeatChange?: (updatedSeats: SelectedSeat[]) => void;
}

const SeatMapComponentPnr: React.FC<SeatMapComponentPnrProps> = ({
  config,
  flightSegments = [],
  selectedSegmentIndex = 0,
  availability = [],
  passengers = [],
  showSegmentSelector = true,
  onSeatChange
}) => {
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>(
    flightSegments[segmentIndex]?.cabinClass || 'Y'
  );
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  const segment = flightSegments?.[segmentIndex];

  // console.log('🔍 Raw segment.equipment =', JSON.stringify(segment?.equipment, null, 2));
  // console.log('🔍 Raw segment =', JSON.stringify(segment, null, 2)); // Полезно для полного анализа

  const normalizedSegment = normalizeSegment(segment);

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
  } = normalizedSegment;


  const flightInfo = (
    <>
      <FlightInfoPanel
        airlineCode={marketingAirline} 
        airlineName={marketingAirlineName}
        flightNumber={flightNumber}
        fromCode={origin}
        fromCity={originCityName}
        toCode={destination}
        toCity={destinationCityName}
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
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ position: 'relative' }}>
          <label style={{ marginRight: '0.5rem' }}>{t('seatMap.segment')}:</label>
          <select
            value={segmentIndex}
            onChange={(e) => {
              setSegmentIndex(Number(e.target.value));
              setCabinClass('Y');
            }}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '1.5rem',
              padding: '0.25rem 1.5rem 0.25rem 0.5rem',
              appearance: 'none',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '200px',
            }}
          >
            {flightSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin} → {seg.destination}, {seg.flightNumber}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          <strong>{t('seatMap.equipmentType')}:</strong> {equipmentType}
        </div>
      </div>

      <div style={{ position: 'relative', display: 'inline-block', marginTop: '0rem' }}>
        <label style={{ marginRight: '0.5rem' }}>{t('seatMap.cabinClass')}:</label>
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value as 'Y' | 'S' | 'C' | 'F' | 'A')}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: '1.5rem',
            padding: '0.25rem 2rem 0.25rem 0.5rem',
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '175px',
          }}
        >
          <option value="Y">{t('seatMap.cabin.economy')}</option>
          <option value="S">{t('seatMap.cabin.premiumEconomy')}</option>
          <option value="C">{t('seatMap.cabin.business')}</option>
          <option value="F">{t('seatMap.cabin.first')}</option>
          <option value="A">{t('seatMap.cabin.all')}</option>
        </select>
      </div>

      {segment && (
        <SeatMapComponentBase
          config={config}
          flightSegments={flightSegments}
          initialSegmentIndex={segmentIndex}
          showSegmentSelector={showSegmentSelector}
          cabinClass={cabinClass}
          availability={Array.isArray(availability) ? availability : []}
          passengers={passengers}
          onSeatChange={(updatedSeats) => {
            setSelectedSeats(updatedSeats);
            onSeatChange?.(updatedSeats);
          }}
          selectedSeats={selectedSeats}
          flightInfo={flightInfo}
          generateFlightData={(segment, index, cabin) =>
            generateFlightData(segment, index, cabin)
          }
        />
      )}
    </div>
  );
};

export default SeatMapComponentPnr;