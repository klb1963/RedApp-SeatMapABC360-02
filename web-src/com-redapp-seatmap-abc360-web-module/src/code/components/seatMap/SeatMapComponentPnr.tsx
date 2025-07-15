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

// file: /code/components/seatMap/SeatMapComponentPnr.tsx

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
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
  onSeatChange,
}) => {
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>(
    flightSegments[segmentIndex]?.cabinClass || 'Y'
  );

  const segmentsWithSequence = flightSegments.map((seg, idx) => ({
    ...seg,
    sequence: seg.sequence ?? idx + 1
  }));

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [allSelectedSeats, setAllSelectedSeats] = useState<SelectedSeat[]>([]);

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

  useEffect(() => {
    if (assignedSeats?.length) {
      const enrichedInitialSeats = assignedSeats
        .map(s => {
          const pax = passengers.find(
            p => String(p.id) === String(s.passengerId) || String(p.nameNumber) === String(s.passengerId)
          );
          if (!pax) return null;
  
          return createSelectedSeat(
            pax,
            s.seat,
            true,
            currentAvailability,
            String(s.segmentNumber)
          );
        })
        .filter(Boolean) as SelectedSeat[];
  
      setAllSelectedSeats(enrichedInitialSeats);
    }
  }, [assignedSeats, passengers, currentAvailability]);

  const memoPassengers = useMemo(() => passengers, []); // 👈 мемоизация на монтировании

  // =======================

  React.useEffect(() => {
    const fetchAvailability = async () => {
      if (!segmentsWithSequence[segmentIndex]) return;
  
      setAvailabilityReady(false);
      setSelectedSeats([]);
      setFlightData(null);
  
      const segmentWithSequence = segmentsWithSequence[segmentIndex];
  
      try {
        const { availability } = await import('../../services/loadSeatMapFromSabre')
          .then(mod => mod.loadSeatMapFromSabre(segmentWithSequence, memoPassengers));
  
        setCurrentAvailability(availability);
        setAvailabilityReady(true);
  
        const currentAvailabilityForSegment =
          availability?.find(a => String(a.segmentNumber) === String(segmentWithSequence.sequence));
  
        const startRow = currentAvailabilityForSegment?.startRow;
        const endRow = currentAvailabilityForSegment?.endRow;
  
        const generatedFlightData = generateFlightData(
          segmentWithSequence,
          segmentIndex,
          mapCabinToCode(cabinClass),
          startRow,
          endRow
        );
  
        setFlightData(generatedFlightData);
  
        if (assignedSeats?.length) {
          const enrichedAssignedSeats = assignedSeats
            .filter(s => String(s.segmentNumber) === String(segmentWithSequence.sequence))
            .map(s => {
              const pax = memoPassengers.find(
                p => String(p.id) === String(s.passengerId) || String(p.nameNumber) === String(s.passengerId)
              );
              if (!pax) return null;
  
              return createSelectedSeat(
                pax,
                s.seat,
                true,
                availability,
                String(segmentWithSequence.sequence)
              );
            })
            .filter(Boolean);
  
          setSelectedSeats(enrichedAssignedSeats);
          setAllSelectedSeats(prev => {
            const others = prev.filter(seat => seat.segmentNumber !== String(segmentWithSequence.sequence));
            return [...others, ...enrichedAssignedSeats];
          });
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
  
  }, [segmentIndex, cabinClass]); // ❌ passengers убраны

  //========================

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
        disabled={true}
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
          assignedSeats={allSelectedSeats.map(s => ({
            passengerId: s.passengerId,
            seat: s.seatLabel,
            segmentNumber: s.segmentNumber
          }))}
          flightData={flightData}
          onSeatChange={(updatedSeats) => {
            setSelectedSeats(updatedSeats);

            setAllSelectedSeats(prev => {
              const others = prev.filter(seat => seat.segmentNumber !== normalizedSegment.segmentNumber);
              return [...others, ...updatedSeats];
            });

            onSeatChange?.(updatedSeats);
          }}
          allSelectedSeats={allSelectedSeats}
          flightInfo={flightInfo}
          legendPanel={legendPanel}
          disableCabinClassChange={true}
        />
      )}

      {!availabilityReady && (
        <div style={{ textAlign: 'center', margin: '2rem' }}>Loading seat map…</div>
      )}
    </div>
  );
};

export default SeatMapComponentPnr;