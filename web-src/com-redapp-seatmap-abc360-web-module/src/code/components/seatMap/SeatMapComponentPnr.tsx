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

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [currentAvailability, setCurrentAvailability] = useState<any[]>(Array.isArray(availability) ? availability : []);
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [flightData, setFlightData] = useState(null);

  const segment = flightSegments?.[segmentIndex];
  const normalizedSegment = {
    ...normalizeSegment(segment, { padFlightNumber: false }),
    segmentNumber: segment?.sequence ? String(segment.sequence) : undefined
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

  /**
   * Loads seat map availability for the selected segment and computes flightData.
   */
  React.useEffect(() => {
    const fetchAvailability = async () => {
      if (!flightSegments[segmentIndex]) return;

      setAvailabilityReady(false);

      const segmentWithSequence = {
        ...flightSegments[segmentIndex],
        sequence: Number(normalizedSegment.segmentNumber) || segmentIndex + 1
      };

      try {
        const { availability } = await import('../../services/loadSeatMapFromSabre')
          .then(mod => mod.loadSeatMapFromSabre(segmentWithSequence, passengers));

        setCurrentAvailability(availability);
        setAvailabilityReady(true);

        const currentAvailabilityForSegment =
          availability?.find(a => String(a.segmentNumber) === String(normalizedSegment.segmentNumber));

        const startRow = currentAvailabilityForSegment?.startRow;
        const endRow = currentAvailabilityForSegment?.endRow;

        const generatedFlightData = generateFlightData(
          flightSegments[segmentIndex],
          segmentIndex,
          mapCabinToCode(cabinClass),
          startRow,
          endRow
        );

        setFlightData(generatedFlightData);

      } catch (err) {
        console.error('Failed to load seat map for segment', segmentWithSequence.segmentNumber, err);
        setCurrentAvailability(null);
        setAvailabilityReady(false);
      }
    };

    fetchAvailability();
  }, [segmentIndex, flightSegments, passengers, cabinClass]);

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
          cabinClass={cabinClass}
          availability={currentAvailability}
          passengers={passengers}
          onSeatChange={(updatedSeats) => {
            setSelectedSeats(updatedSeats);
            onSeatChange?.(updatedSeats);
          }}
          flightInfo={flightInfo}
          legendPanel={legendPanel}
          assignedSeats={assignedSeats}
          flightData={flightData}
        />
      )}

      {!availabilityReady && (
        <div style={{ textAlign: 'center', margin: '2rem' }}>Loading seat map…</div>
      )}
    </div>
  );
};

export default SeatMapComponentPnr;