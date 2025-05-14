// file: SeatMapComponentPnr.tsx

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

interface SeatMapComponentPnrProps {
  config: any;
  flightSegments: any[];
  selectedSegmentIndex?: number;
  availability?: any[];
  passengers?: PassengerOption[];
  showSegmentSelector?: boolean;
}

// Displays seat map component in PNR context
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
        ❌ No flight segments available
      </div>
    );
  }

  // Segment and cabin class state
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>(
    flightSegments[segmentIndex]?.cabinClass || 'Y'
  );

  const segment = flightSegments[segmentIndex];

  const flightInfo = (
    <div>
      <div><strong>Flight info:</strong></div>
      <div>{segment.origin} → {segment.destination}</div>
      <div>📅 Date: {segment.departureDateTime?.split?.('T')[0] || 'not specified'}</div>
      <div>✈️ Equipment: {typeof segment.equipment === 'object'
        ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
        : segment.equipment || 'unknown'}
      </div>
      <div>💺 Class: {cabinClass}</div>
      <hr />
      <SeatLegend/>
    </div>
  );

  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'unknown';

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

  // Filter passengers based on selected IDs
  const selectedPassengers = Array.isArray(passengers)
    ? passengers.filter((p) => selectedPassengerIds.includes(p.id))
    : [];

  return (
    <div style={{ padding: '1rem' }}>
      {/* 🔝 Segment and aircraft info in one row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <label style={{ marginRight: '0.5rem' }}>Segment:</label>
          <select value={segmentIndex} onChange={(e) => {
            setSegmentIndex(Number(e.target.value));
            setCabinClass('Y');
          }}>
            {flightSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin} → {seg.destination}, flight {seg.flightNumber}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          ✈️ <strong>Aircraft:</strong> {equipment}
        </div>
      </div>

      {/* 👔 Cabin class selector */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Cabin class:</label>
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value as 'Y' | 'S' | 'C' | 'F' | 'A')}
        >
          <option value="Y">Economy</option>
          <option value="S">Premium Economy</option>
          <option value="C">Business</option>
          <option value="F">First</option>
          <option value="A">All Cabins</option>
        </select>
      </div>

      {/* 🧩 Seat map */}
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