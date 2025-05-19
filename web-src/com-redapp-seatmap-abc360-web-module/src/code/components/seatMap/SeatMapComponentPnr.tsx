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
import { t } from '../../Context'; // ✅ i18n translate
import { GalleryPanel } from './panels/GalleryPanel';

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
        {t('seatMap.noSegments')} {/* i18n */}
      </div>
    );
  }

  // Segment and cabin class state
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>(
    flightSegments[segmentIndex]?.cabinClass || 'Y'
  );

  const segment = flightSegments[segmentIndex];

    // 🖼️ Aircraft gallery panel
  // const galleryPanel = (
  //   <GalleryPanel />
  // );

  const flightInfo = (
    <div>
      <div><strong>{t('seatMap.flightInfo')}</strong></div> {/* 🏷️ "Flight info" */}
      <div>{segment.origin} → {segment.destination}</div>
      <div>📅 {t('seatMap.date')}: {segment.departureDateTime?.split?.('T')[0] || t('seatMap.dateUnknown')}</div>
      <div>✈️ {t('seatMap.equipment')}: {
        typeof segment.equipment === 'object'
          ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
          : segment.equipment || t('seatMap.unknown')
      }</div>
      <div>💺 {t('seatMap.class')}: {cabinClass}</div>
      <hr />
      <SeatLegend/>
    </div>
  );

  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || t('seatMap.unknown'); // ✅ Localized fallback

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
          <label style={{ marginRight: '0.5rem' }}>{t('seatMap.segment')}:</label> {/* ✅ "Segment" */}
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
        ✈️ <strong>{t('seatMap.aircraft')}:</strong> {equipment} {/* ✅ "Aircraft" */}
        </div>
      </div>

      {/* 👔 Cabin class selector */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>{t('seatMap.cabinClass')}:</label>
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value as 'Y' | 'S' | 'C' | 'F' | 'A')}
        >
          <option value="Y">{t('seatMap.cabin.economy')}</option>
          <option value="S">{t('seatMap.cabin.premiumEconomy')}</option>
          <option value="C">{t('seatMap.cabin.business')}</option>
          <option value="F">{t('seatMap.cabin.first')}</option>
          <option value="A">{t('seatMap.cabin.all')}</option>
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
        // galleryPanel={<GalleryPanel/>}
      />
    </div>
  );
};

export default SeatMapComponentPnr;