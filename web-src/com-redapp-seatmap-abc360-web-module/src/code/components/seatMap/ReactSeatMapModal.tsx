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
import FallbackSeatmapCenter from './internal/FallbackSeatmapCenter';
import FallbackSeatmapLayout from './internal/FallbackSeatmapLayout';
import { FlightInfoPanel } from './panels/FlidhtInfoPanel';
import { SeatLegend } from './panels/SeatLegend';
import { FlightData } from '../../utils/generateFlightData';
import { SegmentCabinSelector } from './panels/SegmentCabinSelector';
import { GalleryPanel } from './panels/GalleryPanel';
import { handleSaveSeats as saveSeatsToSabre } from './handleSaveSeats';
import { handleAutomateSeating as automateSeats } from './handleAutomateSeating';

const ReactSeatMapModal: React.FC = () => {
  const [passengers, setPassengers] = React.useState<any[]>([]);
  const [selectedPassengerId, setSelectedPassengerId] = React.useState<string>('');
  const [selectedSeats, setSelectedSeats] = React.useState<any[]>([]); // seats for all segments

  const [rows, setRows] = React.useState<any[]>([]);
  const [layoutLength, setLayoutLength] = React.useState(0);
  const [selectedDeck, setSelectedDeck] = React.useState('');

  const [flightInfo, setFlightInfo] = React.useState<any>(null);
  const [segments, setSegments] = React.useState<any[]>([]);
  const [segmentIndex, setSegmentIndex] = React.useState(0);
  const [cabinClass, setCabinClass] = React.useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  const formatDuration = (minutes?: number) =>
    minutes ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : '';

  const fetchSeatMap = async (
    segments: any[],
    segmentIndex: number,
    cabinClass: 'Y' | 'S' | 'C' | 'F' | 'A',
    passengers: any[]
  ) => {
    const flightSegment = segments[segmentIndex];

    const seatMapSegment = {
      bookingClass: cabinClass,
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
      duration: formatDuration(flightSegment.duration),
      aircraft: flightSegment.equipment,
      availability,
    });
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const { parsedData: pnrData } = await loadPnrDetailsFromSabre();
      const enrichedPassengers = enrichPassengerData(pnrData.passengers);
      const normalizedSegments = pnrData.segments;

      setPassengers(enrichedPassengers);
      setSelectedPassengerId(enrichedPassengers[0]?.id || '');
      setSegments(normalizedSegments);

      // collect all assigned seats for all segments
      const allAssignedSeats = (pnrData.assignedSeats || []).map(s => {
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
        ? flightSegment.bookingClass
        : 'Y';
      setCabinClass(defaultCabin as typeof cabinClass);

      await fetchSeatMap(normalizedSegments, 0, defaultCabin as typeof cabinClass, enrichedPassengers);
    };

    fetchData();
  }, []);

  React.useEffect(() => {
    const reloadForSegment = async () => {
      const currentSegment = segments[segmentIndex];
      if (!currentSegment) return;

      const { parsedData } = await loadPnrDetailsFromSabre();
      const enrichedPassengers = enrichPassengerData(parsedData.passengers);
      const currentSegmentNumber = currentSegment.segmentNumber;

      setPassengers(enrichedPassengers);
      setSelectedPassengerId(enrichedPassengers[0]?.id || '');

      const assignedSeatsForCurrent = (parsedData.assignedSeats || [])
        .filter(s => String(s.segmentNumber) === String(currentSegmentNumber))
        .map(s => {
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

      setSelectedSeats(prev => {
        const withoutCurrent = prev.filter(s => s.segmentNumber !== currentSegmentNumber);
        return [...withoutCurrent, ...assignedSeatsForCurrent];
      });

      await fetchSeatMap(segments, segmentIndex, cabinClass, enrichedPassengers);
    };

    if (segments.length > 0) {
      reloadForSegment();
    }
  }, [segmentIndex, cabinClass, segments.length]);

  React.useEffect(() => {
    if (rows.length > 0 && !selectedDeck) {
      setSelectedDeck(rows[0].deckId || 'Maindeck');
    }
  }, [rows]);

  const handleSaveSeatsClick = async () => {
    console.log('✅ Saving seats for all segments');
    console.log('🔥 selectedSeats before SAVE:', selectedSeats);

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

    console.log('📝 seatsForSabre:', seatsForSabre);

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
          setSelectedSeats={setSelectedSeats}
          assignedSeats={selectedSeatsForCurrentSegment.map(s => ({
            passengerId: s.passengerId,
            seat: s.seatLabel,
            segmentNumber: s.segmentNumber,
          }))}
          config={{}}
          flight={{} as FlightData}
          availability={flightInfo?.availability || []}
          iframeRef={{ current: null }}
          handleResetSeat={() => setSelectedSeats([])}
          handleSave={handleSaveSeatsClick}
          handleAutomateSeating={() => {
            if (!flightInfo?.availability) {
              console.warn('⚠️ No availability data');
              return;
            }
            const newSeats = automateSeats({
              passengers,
              availableSeats: flightInfo.availability,
              segmentNumber: segments[segmentIndex]?.segmentNumber,
            });
            if (newSeats.length === 0) {
              console.warn('⚠️ No seats assigned automatically');
              return;
            }
            setSelectedSeats(prev => {
              const withoutCurrent = prev.filter(
                s => s.segmentNumber !== currentSegmentNumber
              );
              return [...withoutCurrent, ...newSeats];
            });
          }}
          saveDisabled={false}
        />
      }
      center={
        <FallbackSeatmapCenter
          passengers={passengers}
          selectedPassengerId={selectedPassengerId}
          selectedSeats={selectedSeatsForCurrentSegment}
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