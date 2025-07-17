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
import { useFallbackSeatMapAvailability } from './internal/useFallbackSeatMapAvailability';

const ReactSeatMapModal: React.FC = () => {
  const [initialData, setInitialData] = React.useState<{
    passengers: any[];
    segments: any[];
    assignedSeats: any[];
    defaultCabin: any;
  } | null>(null);

  const [rows, setRows] = React.useState<any[]>([]);
  const [layoutLength, setLayoutLength] = React.useState(0);
  const [flightInfo, setFlightInfo] = React.useState<any>(null);
  const [selectedDeck, setSelectedDeck] = React.useState('');

  React.useEffect(() => {
    const fetchInitialData = async () => {
      const { parsedData } = await loadPnrDetailsFromSabre();
      const passengers = enrichPassengerData(parsedData.passengers);
      const segments = parsedData.segments;

      const defaultCabin =
        ['F', 'C', 'S', 'Y'].includes(segments[0].bookingClass) ? segments[0].bookingClass : 'Y';

      const assignedSeats = (parsedData.assignedSeats || []).map(s => {
        const pax = passengers.find(p => p.id === s.passengerId);
        return {
          passengerId: s.passengerId,
          seatLabel: s.seat,
          segmentNumber: s.segmentNumber,
          passengerInitials: pax?.passengerInitials || '', // чтобы удовлетворить тип
          passengerLabel: pax?.label || '',
          passengerColor: pax?.passengerColor || '',
          seat: { seatLabel: s.seat, price: '0' },
        };
      });

      setInitialData({ passengers, segments, assignedSeats, defaultCabin });
    };

    fetchInitialData();
  }, []);

  const {
    selectedSeats,
    selectedSeatsForCurrent,
    setSelectedSeats,
    selectedPassengerId,
    setSelectedPassengerId,
    selectedSegmentIndex,
    setSelectedSegmentIndex,
    cabinClass,
    setCabinClass,
    passengers,
    segments,
    currentSegment,
    currentSegmentNumber,
    resetCurrentSegmentSeats,
  } = useFallbackSeatMapAvailability(
    initialData
      ? {
          passengers: initialData.passengers,
          segments: initialData.segments,
          initialAssignedSeats: initialData.assignedSeats,
          initialSegmentIndex: 0,
          initialCabinClass: initialData.defaultCabin,
        }
      : {
          passengers: [],
          segments: [],
        }
  );

  const fetchSeatMap = async () => {
    if (!currentSegment) return;

    const seatMapSegment = {
      bookingClass: cabinClass,
      marketingCarrier: currentSegment.marketingCarrier || 'XX',
      marketingFlightNumber: currentSegment.marketingFlightNumber || '000',
      flightNumber: currentSegment.marketingFlightNumber || '000',
      departureDate: currentSegment.departureDate,
      origin: currentSegment.origin,
      destination: currentSegment.destination,
    };

    const { seatInfo, layoutLetters, availability } = await loadSeatMapFromSabre(seatMapSegment, passengers);
    const { rows, layoutLength } = convertSeatMapToReactSeatmapFormat(seatInfo, layoutLetters);

    setRows(rows);
    setLayoutLength(layoutLength);

    setFlightInfo({
      airlineCode: currentSegment.marketingCarrier,
      airlineName: currentSegment.airlineName || '',
      flightNumber: currentSegment.marketingFlightNumber,
      fromCode: currentSegment.origin,
      toCode: currentSegment.destination,
      date: currentSegment.departureDate,
      aircraft: currentSegment.equipment,
      duration: currentSegment.duration,
      availability,
    });
  };

  React.useEffect(() => {
    if (segments.length > 0 && passengers.length > 0) fetchSeatMap();
  }, [segments, passengers, currentSegmentNumber, cabinClass]);

  React.useEffect(() => {
    if (rows.length > 0 && !selectedDeck) setSelectedDeck(rows[0].deckId || 'Maindeck');
  }, [rows]);

  const handleSaveSeatsClick = async () => {
    const seatsForSabre = selectedSeats.map(s => ({
      passengerId: s.passengerId,
      seatLabel: s.seatLabel,
      passengerLabel: s.passengerLabel,
      passengerInitials: s.passengerInitials,
      passengerColor: s.passengerColor,
      segmentNumber: s.segmentNumber,
      seat: s.seat,
    }));

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

  return (
    <FallbackSeatmapLayout
      flightInfo={
        <>
          <SegmentCabinSelector
            flightSegments={segments.map(seg => ({
              origin: seg.origin,
              destination: seg.destination,
              flightNumber: seg.marketingFlightNumber,
            }))}
            segmentIndex={selectedSegmentIndex}
            setSegmentIndex={setSelectedSegmentIndex}
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
          selectedSeats={selectedSeatsForCurrent}
          selectedPassengerId={selectedPassengerId}
          setSelectedPassengerId={setSelectedPassengerId}
          setSelectedSeats={setSelectedSeats}
          assignedSeats={selectedSeatsForCurrent.map(s => ({
            passengerId: s.passengerId,
            seat: s.seatLabel,
            segmentNumber: s.segmentNumber,
          }))}
          config={{}}
          flight={{} as FlightData}
          availability={flightInfo?.availability || []}
          iframeRef={{ current: null }}
          handleResetSeat={resetCurrentSegmentSeats}
          handleSave={handleSaveSeatsClick}
          handleAutomateSeating={() => {
            const newSeats = automateSeats({
              passengers,
              availableSeats: flightInfo?.availability || [],
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
          selectedSeats={selectedSeatsForCurrent}
          setSelectedSeats={setSelectedSeats}
          setSelectedPassengerId={setSelectedPassengerId}
          rows={rows}
          layoutLength={layoutLength}
          selectedDeck={selectedDeck}
          setSelectedDeck={setSelectedDeck}
          segmentIndex={selectedSegmentIndex}
          segments={segments}
        />
      }
      legendPanel={<SeatLegend />}
    />
  );
};

export default ReactSeatMapModal;