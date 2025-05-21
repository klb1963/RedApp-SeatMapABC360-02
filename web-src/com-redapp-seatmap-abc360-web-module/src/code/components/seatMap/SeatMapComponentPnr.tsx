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
import SeatMapComponentBase from './SeatMapComponentBase';
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
}

const SeatMapComponentPnr: React.FC<SeatMapComponentPnrProps> = ({
  config,
  flightSegments = [],
  selectedSegmentIndex = 0,
  availability = [],
  passengers = [],
  showSegmentSelector = true
}) => {
  if (!flightSegments.length) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        {t('seatMap.noSegments')}
      </div>
    );
  }

  // Segment and cabin class state
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>(
    flightSegments[segmentIndex]?.cabinClass || 'Y'
  );

  const segment = flightSegments[segmentIndex];

  // Extract flight info fields
  const airlineName = segment.marketingCarrier || '—';
  const flightNumber = segment.flightNumber || '—';
  const fromCode = segment.origin || '—';
  const fromCity = segment.originCityName || '';
  const toCode = segment.destination || '—';
  const toCity = segment.destinationCityName || '';
  const date = segment.departureDateTime?.split?.('T')[0] || t('seatMap.dateUnknown');
  const duration = segment.duration || '';
  const equipmentText =
    typeof segment.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment.equipment || t('seatMap.unknown');

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
        equipment={equipmentText}
      />
      <SeatLegend />
    </>
  );

  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || t('seatMap.unknown');

  // State: selected passenger IDs
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<string[]>(
    Array.isArray(passengers) ? passengers.map((p) => p.id) : []
  );

  // State: selected seats for all passengers
  const [selectedSeats, setSelectedSeats] = useState<
    { passengerId: string; seatLabel: string }[]
  >([]);

  const handleTogglePassenger = (id: string) => {
    setSelectedPassengerIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const selectedPassengers = Array.isArray(passengers)
    ? passengers.filter((p) => selectedPassengerIds.includes(p.id))
    : [];

  return (
    <div style={{ padding: '1rem' }}>
      {/* Segment selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        {/* Segment */}
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
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '200px',
            }}
          >
            {flightSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin} → {seg.destination}, flight {seg.flightNumber}
              </option>
            ))}
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

        {/* Equipment */}
        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          <strong>{t('seatMap.aircraft')}:</strong> {equipment}
        </div>
      </div>

      {/* Cabin class selector */}
      <div style={{ position: 'relative', display: 'inline-block', marginTop: '0rem' }}>
        <label style={{ marginRight: '0.5rem' }}>{t('seatMap.cabinClass')}:</label>

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
            <option value="Y">{t('seatMap.cabin.economy')}</option>
            <option value="S">{t('seatMap.cabin.premiumEconomy')}</option>
            <option value="C">{t('seatMap.cabin.business')}</option>
            <option value="F">{t('seatMap.cabin.first')}</option>
            <option value="A">{t('seatMap.cabin.all')}</option>
          </select>

          {/* Arrow */}
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
        flightSegments={flightSegments}
        initialSegmentIndex={segmentIndex}
        showSegmentSelector={false}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(segment, index, cabin)
        }
        availability={Array.isArray(availability) ? availability : []}
        passengers={selectedPassengers}
        onSeatChange={(updatedSeats) => setSelectedSeats(updatedSeats)}
        selectedSeats={selectedSeats}
        flightInfo={flightInfo}
      />
    </div>
  );
};

export default SeatMapComponentPnr;