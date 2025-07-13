// file: /code/components/seatMap/SeatMapComponentPnr.tsx

/**
 * SeatMapComponentPnr.tsx
 *
 * React component that renders the Seat Map UI for a PNR context.
 *
 * Responsibilities:
 * - Allows selection of flight segment and cabin class
 * - Displays flight details, aircraft info, and seat legend
 * - Loads seat map availability and passes data to SeatMapComponentBase
 *
 * Uses SeatMapComponentBase to render the actual seat map inside an iframe.
 */

import * as React from 'react';
import { useState } from 'react';
import SeatMapComponentBase, { SelectedSeat } from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import SeatLegend from './panels/SeatLegend';
import { PassengerOption } from '../../utils/parsePnrData';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { normalizeSegment } from '../../utils/normalizeSegment';
import { t } from '../../Context';
import { SegmentCabinSelector } from './panels/SegmentCabinSelector';
import { mapCabinToCode } from '../../utils/mapCabinToCode';
import { createSelectedSeat } from './helpers/createSelectedSeat';

interface SeatMapComponentPnrProps {
  config: any;
  flightSegments: any[];
  selectedSegmentIndex?: number;
  passengers?: PassengerOption[];
  assignedSeats?: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[];
  showSegmentSelector?: boolean;
  onSeatChange?: (updatedSeats: SelectedSeat[]) => void;
  availability?: any[];
}

const SeatMapComponentPnr: React.FC<SeatMapComponentPnrProps> = ({
  config,
  flightSegments = [],
  selectedSegmentIndex = 0,
  availability = [],
  passengers = [],
  assignedSeats = [],
  showSegmentSelector = true,
  onSeatChange
}) => {
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>(
    flightSegments[segmentIndex]?.cabinClass || 'Y'
  );

  // Make sure all segments have a sequence property
  const segmentsWithSequence = flightSegments.map((seg, idx) => ({
    ...seg,
    sequence: seg.sequence ?? idx + 1
  }));

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [currentAvailability, setCurrentAvailability] = useState<any[]>(Array.isArray(availability) ? availability : []);
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [flightData, setFlightData] = useState(null);

  const segment = segmentsWithSequence?.[segmentIndex];
  const normalizedSegment = {
    ...normalizeSegment(segment, { padFlightNumber: false }),
    segmentNumber: String(segment.sequence)
  };

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
    aircraftDescription,
  } = normalizedSegment;

  const flightInfo = (
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
      aircraft={aircraftDescription}
      availability={currentAvailability}
    />
  );

  const legendPanel = <SeatLegend />;

  window.name = ''; // disable fallback-seatmap mode

  // Current segmentNumber for transfering to Base
  // const segmentNumber = normalizedSegment.segmentNumber;

    /**
 * Loads seat map availability for the selected segment and computes flightData.
 * Also initializes selectedSeats if assignedSeats from PNR exist for this segment.
 */
React.useEffect(() => {
  const fetchAvailability = async () => {
    if (!segmentsWithSequence[segmentIndex]) return;

    // Reset state before fetching new availability
    setAvailabilityReady(false);
    setSelectedSeats([]);
    setFlightData(null);

    const segmentWithSequence = segmentsWithSequence[segmentIndex];

    try {
      // Load availability data for the selected segment
      const { availability } = await import('../../services/loadSeatMapFromSabre')
        .then(mod => mod.loadSeatMapFromSabre(segmentWithSequence, passengers));

      setCurrentAvailability(availability);
      setAvailabilityReady(true);

      const currentAvailabilityForSegment =
        availability?.find(a => String(a.segmentNumber) === String(segmentWithSequence.sequence));

      const startRow = currentAvailabilityForSegment?.startRow;
      const endRow = currentAvailabilityForSegment?.endRow;

      // Generate flightData used by the SeatMapComponentBase
      const generatedFlightData = generateFlightData(
        segmentWithSequence,
        segmentIndex,
        mapCabinToCode(cabinClass),
        startRow,
        endRow
      );

      setFlightData(generatedFlightData);

      // If assignedSeats are passed from PNR, enrich and set them for this segment
      if (assignedSeats?.length) {
        const enrichedAssignedSeats = assignedSeats
          .filter(s => String(s.segmentNumber) === String(segmentWithSequence.sequence))
          .map(s => {
            const pax = passengers.find(
              p => String(p.id) === String(s.passengerId) || String(p.nameNumber) === String(s.passengerId)
            );
            if (!pax) return null;

            return createSelectedSeat(
              pax,
              s.seat,
              true, // readOnly = true
              availability,
              String(segmentWithSequence.sequence)
            );
          })
          .filter(Boolean);

        setSelectedSeats(enrichedAssignedSeats);
      }

    } catch (err) {
      console.error(
        'Failed to load seat map for segment',
        segmentWithSequence.sequence,
        err
      );
      setCurrentAvailability(null);
      setAvailabilityReady(false);
    }
  };

  fetchAvailability();

}, [segmentIndex, passengers, cabinClass]);

  return (
    <div style={{ padding: '1rem' }}>
      <SegmentCabinSelector
        flightSegments={flightSegments}
        segmentIndex={segmentIndex}
        setSegmentIndex={(index) => {
          setSegmentIndex(index);
          setCabinClass(flightSegments[index]?.cabinClass || 'Y');
        }}
        cabinClass={cabinClass}
        setCabinClass={setCabinClass}
      />

      {segment && availabilityReady && flightData && (
        <SeatMapComponentBase
          key={`${segmentIndex}-${cabinClass}`}
          config={config}
          flightSegments={flightSegments}
          segmentIndex={segmentIndex}
          showSegmentSelector={showSegmentSelector}
          segmentNumber={normalizedSegment.segmentNumber}
          cabinClass={cabinClass}
          availability={currentAvailability}
          passengers={passengers}
          assignedSeats={selectedSeats.map(s => ({
            passengerId: s.passengerId,
            seat: s.seat.seatLabel,
            segmentNumber: s.segmentNumber
          }))}
          flightData={flightData}
          onSeatChange={(updatedSeats) => {
            setSelectedSeats(updatedSeats);
            onSeatChange?.(updatedSeats);
          }}
          flightInfo={flightInfo}
          legendPanel={legendPanel}
          
          
        />
      )}

      {!availabilityReady && (
        <div style={{ textAlign: 'center', margin: '2rem' }}>Loading seat map…</div>
      )}
    </div>
  );
};

export default SeatMapComponentPnr;