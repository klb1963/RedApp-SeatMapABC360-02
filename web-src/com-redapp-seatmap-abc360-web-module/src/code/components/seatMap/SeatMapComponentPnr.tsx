// file: /code/components/seatMap/SeatMapComponentPnr.tsx

/**
 * SeatMapComponentPnr.tsx
 *
 * Main React component for rendering the Seat Map UI in the PNR context.
 *
 * 📋 Responsibilities:
 * - Display the UI for selecting seats for passengers on a given PNR
 * - Handle segment and cabin class selection
 * - Fetch seat map availability and prepare data for the renderer
 * - Render the seat map itself, along with flight info and seat legend
 *
 * 🧩 Composition:
 * - Uses `SegmentCabinSelector` to display segment & cabin controls
 * - Uses `FlightInfoPanel` to show flight metadata
 * - Uses `SeatLegend` to display seat type/color legend
 * - Uses `SeatMapComponentBase` to render the interactive seat map itself
 *
 * 💡 Notes:
 * - This component is designed for Sabre PNR context (not for booking flow)
 * - Uses `useSeatMapAvailability` hook to handle all data loading/state
 * - Supports fallback scenarios and segment switching
 */

import * as React from 'react';
import { useState, useMemo } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import SeatLegend from './panels/SeatLegend';
import { PassengerOption } from '../../utils/parsePnrData';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { normalizeSegment } from '../../utils/normalizeSegment';
import { t } from '../../Context';
import { SegmentCabinSelector } from './panels/SegmentCabinSelector';
import { useSeatMapAvailability } from './hooks/useSeatMapAvailability';

interface SeatMapComponentPnrProps {
  config: any;
  flightSegments: any[]; // list of flight segments from PNR
  selectedSegmentIndex?: number; // initial segment index to display
  passengers?: PassengerOption[]; // passengers in the PNR
  assignedSeats?: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[];
  showSegmentSelector?: boolean; // whether to show segment selector panel
  onSeatChange?: (updatedSeats: any[]) => void; // callback when seats change
  availability?: any[]; // optional pre-loaded availability
}

const SeatMapComponentPnr: React.FC<SeatMapComponentPnrProps> = ({
  config,
  flightSegments = [],
  selectedSegmentIndex = 0,
  passengers = [],
  assignedSeats = [],
  showSegmentSelector = true,
  onSeatChange,
}) => {
  /**
   * Currently selected segment and cabin class.
   * This controls which segment's seat map is displayed.
   */
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>(
    flightSegments[segmentIndex]?.cabinClass || 'Y'
  );

  const [isFallback, setIsFallback] = useState(false);

  /**
   * Add sequence numbers to each segment (fallback if not present in PNR data).
   */
  const segmentsWithSequence = flightSegments.map((seg, idx) => ({
    ...seg,
    sequence: seg.sequence ?? idx + 1
  }));

  /**
   * Memoized current segment.
   * Prevents unnecessary re-renders & effects when props change.
   */
  const memoSegment = useMemo(
    () => segmentsWithSequence[segmentIndex],
    [segmentsWithSequence, segmentIndex]
  );

  /**
   * Normalized segment data.
   * Converts raw Sabre segment to a consistent, display-friendly format.
   */
  const normalizedSegment = {
    ...normalizeSegment(memoSegment, { padFlightNumber: false }),
    segmentNumber: String(memoSegment.sequence)
  };

  /**
   * Memoized passengers array.
   * Avoids triggering useEffect on every render if passengers are unchanged.
   */
  const memoPassengers = useMemo(() => passengers, []);

  /**
   * Load seat map availability, assigned seats, and flight metadata.
   * Uses `useSeatMapAvailability` to encapsulate the fetching and state management.
   */
  const {
    availabilityReady,
    currentAvailability,
    flightData,
    selectedSeats,
    setSelectedSeats,
    allSelectedSeats,
    setAllSelectedSeats,
  } = useSeatMapAvailability({
    segment: memoSegment,
    segmentIndex,
    cabinClass,
    passengers: memoPassengers,
    assignedSeats,
  });

  /**
   * Flight information panel showing origin, destination, flight number, etc.
   */
  const flightInfo = (
    <FlightInfoPanel
      airlineCode={normalizedSegment.marketingAirline}
      airlineName={normalizedSegment.marketingAirlineName}
      flightNumber={normalizedSegment.flightNumber}
      fromCode={normalizedSegment.origin}
      fromCity={normalizedSegment.originCityName}
      toCode={normalizedSegment.destination}
      toCity={normalizedSegment.destinationCityName}
      date={normalizedSegment.departureDateTime?.split?.('T')[0] || t('seatMap.dateUnknown')}
      duration={normalizedSegment.duration}
      aircraft={normalizedSegment.aircraftDescription}
      availability={currentAvailability}
    />
  );

  /**
   * Legend panel showing icons/colors for different seat types.
   */
  const legendPanel = <SeatLegend />;

  /**
   * Ensure fallback-seatmap mode is disabled for this component.
   * Prevents iframe fallback mode by clearing global `window.name`
   * which is sometimes set when opened via modal iframe.
   */
  window.name = '';

  return (
    <div style={{ padding: '1rem' }}>
      {/* Segment & cabin selector panel */}
      {!isFallback && (
      <SegmentCabinSelector
        flightSegments={flightSegments}
        segmentIndex={segmentIndex}
        setSegmentIndex={(index) => {
          setSegmentIndex(index);
          setCabinClass(flightSegments[index]?.cabinClass || 'Y');
        }}
        cabinClass={cabinClass}
        setCabinClass={setCabinClass}
        disabled={true}
      />
    )}

      {/* Render seat map if data is loaded */}
      {memoSegment && availabilityReady && flightData && (
        <SeatMapComponentBase
          key={`seatmap-${segmentIndex}-${cabinClass}`}
          // 🧠 Force remount of SeatMapComponentBase when segment or cabin class changes,
          // to reset internal state and trigger fresh effects (e.g., rows, deck selection).
          // This avoids stale data being retained across different segment/class views.
          config={config}
          flightSegments={flightSegments}
          segmentIndex={segmentIndex}
          showSegmentSelector={showSegmentSelector}
          segmentNumber={normalizedSegment.segmentNumber}
          cabinClass={cabinClass}
          availability={currentAvailability}
          passengers={passengers}
          assignedSeats={allSelectedSeats.map(s => ({
            passengerId: s.passengerId,
            seat: s.seatLabel,
            segmentNumber: s.segmentNumber
          }))}
          flightData={flightData}
          onSeatChange={(updatedSeats) => {
            // Update state for current segment seats
            setSelectedSeats(updatedSeats);
            // Merge into allSelectedSeats
            setAllSelectedSeats(prev => {
              const others = prev.filter(seat => seat.segmentNumber !== normalizedSegment.segmentNumber);
              return [...others, ...updatedSeats];
            });

            // Notify parent (if any)
            onSeatChange?.(updatedSeats);
          }}
          allSelectedSeats={allSelectedSeats}
          flightInfo={flightInfo}
          legendPanel={legendPanel}
          disableCabinClassChange={true}

          onFallbackDetected={(isFallbackMode) => {
            setIsFallback(isFallbackMode);
          }}

        />
      )}

       {/* Show loading placeholder while availability is fetched */}
       {!availabilityReady && (
        <div style={{ textAlign: 'center', margin: '2rem' }}>
          Loading...
        </div>
      )}
    </div>
  );
};

export default SeatMapComponentPnr;