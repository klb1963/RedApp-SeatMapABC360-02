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

  const airlineName = segment?.marketingCarrier || '—';
  const flightNumber = segment?.flightNumber || '—';
  const fromCode = segment?.origin || '—';
  const fromCity = segment?.originCityName || '';
  const toCode = segment?.destination || '—';
  const toCity = segment?.destinationCityName || '';
  const date = segment?.departureDateTime?.split?.('T')[0] || t('seatMap.dateUnknown');
  const duration = segment?.duration || '';
  const equipmentType = typeof segment?.equipment === 'object'
    ? segment.equipment?.EquipmentType || '—'
    : '—';
  const aircraftDescription = typeof segment?.equipment === 'object'
    ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded || t('seatMap.unknown')
    : t('seatMap.unknown');

  const flightInfo = (
    <>
      <FlightInfoPanel
        airlineName={airlineName}
        flightNumber={flightNumber}
        fromCode={fromCode}
        fromCity={fromCity}
        toCode={toCode}
        toCity={toCity}
        date={date}
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