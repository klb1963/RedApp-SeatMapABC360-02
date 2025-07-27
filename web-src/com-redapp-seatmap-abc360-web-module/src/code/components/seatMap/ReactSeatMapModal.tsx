// file: /code/components/seatMap/ReactSeatMapModal.tsx

/**
 * ReactSeatMapModal.tsx
 *
 * Fallback Seat Map modal implementation, rendered if iframe-based Quicket map fails.
 * Loads passengers, segments, assigned seats from PNR, and renders React-based seatmap.
 *
 * Supports:
 * - Segment switching and cabin class switching
 * - Auto-seating and manual seat selection
 * - Synchronization of assigned seats with Sabre on save
 */

import * as React from 'react';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { enrichPassengerData } from './utils/enrichPassengerData';
import { loadSeatMapFromSabre } from '../../services/loadSeatMapFromSabre';
import { convertSeatMapToReactSeatmapFormat } from '../../utils/convertSeatMapToReactSeatmap';

import { PassengerPanel } from './panels/PassengerPanel';
import FallbackSeatmapCenter from './fallback-seat-map/FallbackSeatmapCenter';
import FallbackSeatmapLayout from './fallback-seat-map/FallbackSeatmapLayout';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { SeatLegend } from './panels/SeatLegend';
import { FlightData } from '../../utils/generateFlightData';
import { SegmentCabinSelector } from './panels/SegmentCabinSelector';
import { GalleryPanel } from './panels/GalleryPanel';
import { handleSaveSeats as saveSeatsToSabre } from './handleSaveSeats';
import { handleAutomateSeating as automateSeats } from './handleAutomateSeating';

type CabinClass = 'Y' | 'S' | 'C' | 'F' | 'A';

const ReactSeatMapModal: React.FC = () => {
  const [passengers, setPassengers] = React.useState<any[]>([]);
  const [selectedPassengerId, setSelectedPassengerId] = React.useState<string>('');
  const [selectedSeats, setSelectedSeats] = React.useState<any[]>([]);
  const [rows, setRows] = React.useState<any[]>([]);
  const [layoutLength, setLayoutLength] = React.useState(0);
  const [selectedDeck, setSelectedDeck] = React.useState('');
  const [flightInfo, setFlightInfo] = React.useState<any>(null);
  const [segments, setSegments] = React.useState<any[]>([]);
  const [segmentIndex, setSegmentIndex] = React.useState(0);
  const [cabinClass, setCabinClass] = React.useState<CabinClass>('Y');

  const fetchSeatMap = async (
    segments: any[],
    segmentIndex: number,
    cabin: CabinClass,
    passengers: any[]
  ) => {
    const flightSegment = segments[segmentIndex];
    if (!flightSegment) return;

    const seatMapSegment = {
      bookingClass: cabin,
      marketingCarrier: flightSegment.marketingCarrier || 'XX',
      marketingFlightNumber: flightSegment.marketingFlightNumber || '000',
      flightNumber: flightSegment.marketingFlightNumber || '000',
      departureDate: flightSegment.departureDate,
      origin: flightSegment.origin,
      destination: flightSegment.destination,
    };

    const { seatInfo, layoutLetters, availability } =
      await loadSeatMapFromSabre(seatMapSegment, passengers);
    const { rows, layoutLength } = convertSeatMapToReactSeatmapFormat(seatInfo, layoutLetters);

    setRows(rows);
    setLayoutLength(layoutLength);

    setFlightInfo({
      airlineCode: flightSegment.marketingCarrier,
      airlineName: flightSegment.airlineName || '',
      flightNumber: flightSegment.marketingFlightNumber,
      fromCode: flightSegment.origin,
      toCode: flightSegment.destination,
      date: flightSegment.departureDate,
      aircraft: flightSegment.equipment,
      duration: flightSegment.duration,
      availability,
    });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const { parsedData } = await loadPnrDetailsFromSabre();
      const enrichedPassengers = enrichPassengerData(parsedData.passengers);
      const normalizedSegments = parsedData.segments;

      setPassengers(enrichedPassengers);
      setSelectedPassengerId(enrichedPassengers[0]?.id || '');
      setSegments(normalizedSegments);

      const allAssignedSeats = (parsedData.assignedSeats || []).map(s => {
        const pax = enrichedPassengers.find(p => p.id === s.passengerId);
        return {
          passengerId: s.passengerId,
          seatLabel: s.seat,
          confirmed: true,
          price: 0,
          passengerInitials: pax?.passengerInitials || '',
          passengerColor: pax?.passengerColor || '',
          segmentNumber: s.segmentNumber,
        };
      });
      setSelectedSeats(allAssignedSeats);

      const flightSegment = normalizedSegments[0];
      const defaultCabin = ['F', 'C', 'S', 'Y'].includes(flightSegment.bookingClass)
        ? (flightSegment.bookingClass as CabinClass)
        : 'Y';
      setCabinClass(defaultCabin);

      await fetchSeatMap(normalizedSegments, 0, defaultCabin, enrichedPassengers);
    };

    fetchData();
  }, []);

  React.useEffect(() => {
    if (!segments[segmentIndex]) return;
    fetchSeatMap(segments, segmentIndex, cabinClass, passengers);
  }, [segmentIndex, cabinClass]);

  React.useEffect(() => {
    if (rows.length > 0 && !selectedDeck) {
      setSelectedDeck(rows[0].deckId || 'Maindeck');
    }
  }, [rows]);

  const handleSaveSeatsClick = async () => {
    console.log('✅ Saving seats for all segments', selectedSeats);
    console.log('+++🔥+++ selectedSeats before SAVE:', selectedSeats);

    const seatsForSabre = selectedSeats.map(s => {
      const pax = passengers.find(p => p.id === s.passengerId);
      return {
        passengerId: pax?.nameNumber || s.passengerId,
        seatLabel: s.seatLabel,
        passengerType: pax?.passengerType || '',
        passengerLabel: pax?.label || '',
        passengerColor: s.passengerColor || '',
        initials: s.passengerInitials || '',
        passengerInitials: s.passengerInitials || '',
        segmentNumber: s.segmentNumber,
        seat: {
          seatLabel: s.seatLabel,
          price: String(s.price || '0'),
        },
      };
    });

    try {
      const { handleDeleteSeats } = await import('./handleDeleteSeats');
      await handleDeleteSeats(async () => {
        await saveSeatsToSabre(seatsForSabre);
      });
    } catch (error) {
      console.error('❌ Error saving seats:', error);
      alert('❌ Error saving. See console.');
    }
  };

  const currentSegmentNumber = segments[segmentIndex]?.segmentNumber;
  const selectedSeatsForCurrentSegment = selectedSeats.filter(
    s => s.segmentNumber === currentSegmentNumber
  );

  React.useEffect(() => {
    console.log('+++🪑🪑🪑+++ ACCUMULATED selectedSeats (all segments):', selectedSeats);
  }, [selectedSeats]);

  return (
    <FallbackSeatmapLayout
      flightInfo={
        <>
          <SegmentCabinSelector
            flightSegments={segments}
            segmentIndex={segmentIndex}
            setSegmentIndex={setSegmentIndex}
            cabinClass={cabinClass}
            setCabinClass={setCabinClass}
            disabled={true}
          />
          {flightInfo && <FlightInfoPanel {...flightInfo} />}
          <GalleryPanel />
        </>
      }

      passengerPanel={
        <PassengerPanel
          passengers={passengers}
          selectedSeats={selectedSeatsForCurrentSegment}
          selectedPassengerId={selectedPassengerId}
          setSelectedPassengerId={setSelectedPassengerId}

          setSelectedSeats={(seat: any) => {
            setSelectedSeats(prev => {
              console.log('💾 BEFORE setSelectedSeats, prev:', prev);
              const next = [
                ...prev.filter(
                  (s: any) =>
                    !(
                      s.passengerId === seat.passengerId &&
                      s.segmentNumber === currentSegmentNumber
                    )
                ),
                {
                  ...seat,
                  segmentNumber: currentSegmentNumber
                }
              ];
              console.log('💾 AFTER setSelectedSeats, next:', next);
              return next;
            });
          }}

          assignedSeats={selectedSeatsForCurrentSegment.map(s => ({
            passengerId: s.passengerId,
            seat: s.seatLabel,
            segmentNumber: s.segmentNumber,
          }))}
          config={{}}
          flight={{} as FlightData}
          availability={flightInfo?.availability || []}
          iframeRef={{ current: null }}
          handleResetSeat={() =>
            setSelectedSeats(prev =>
              prev.filter(s => s.segmentNumber !== currentSegmentNumber)
            )
          }

          handleSave={handleSaveSeatsClick}

          handleAutomateSeating={() => {
            if (!flightInfo?.availability) return;
            const newSeats = automateSeats({
              passengers,
              availableSeats: flightInfo.availability,
              segmentNumber: currentSegmentNumber,
            });

            setSelectedSeats(prev => [
              ...prev.filter(s => s.segmentNumber !== currentSegmentNumber),
              ...newSeats,
            ]);
          }}
          saveDisabled={false}
        />
      }

      center={
        <FallbackSeatmapCenter
          passengers={passengers}
          selectedPassengerId={selectedPassengerId}
          selectedSeats={selectedSeats}
          setSelectedSeats={setSelectedSeats}
          setSelectedPassengerId={setSelectedPassengerId}
          rows={rows}
          layoutLength={layoutLength}
          selectedDeck={selectedDeck}
          setSelectedDeck={setSelectedDeck}
          segmentIndex={segmentIndex}
          segments={segments}
        />
      }
      legendPanel={<SeatLegend />}
    />
  );
};

export default ReactSeatMapModal;