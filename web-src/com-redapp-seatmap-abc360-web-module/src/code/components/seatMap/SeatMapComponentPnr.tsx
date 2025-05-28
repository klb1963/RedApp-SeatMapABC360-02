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
import { PassengerOption } from '../../utils/parsePnrData';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { normalizeSegment } from '../../utils/normalizeSegment';
import { t } from '../../Context';
import { SegmentCabinSelector } from './panels/SegmentCabinSelector';

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
  availability?: {
    price: number;
    currency: string;
  }[];
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

  const segment = flightSegments?.[segmentIndex];
  const normalizedSegment = normalizeSegment(segment, { padFlightNumber: false });

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
        aircraft={aircraftDescription}
        availability={Array.isArray(availability) ? availability : []}
      />
      <SeatLegend />
    </>
  );

  return (
    <div style={{ padding: '1rem' }}>
      <SegmentCabinSelector
        flightSegments={flightSegments}
        segmentIndex={segmentIndex}
        setSegmentIndex={(index) => {
          setSegmentIndex(index);
          setCabinClass('Y');
        }}
        cabinClass={cabinClass}
        setCabinClass={setCabinClass}
      />

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
          assignedSeats={assignedSeats}
          generateFlightData={(segment, index, cabin) =>
            generateFlightData(segment, index, cabin)
          }
        />
      )}
    </div>
  );
};

export default SeatMapComponentPnr;