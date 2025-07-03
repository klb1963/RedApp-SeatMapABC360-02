// file: /code/components/seatMap/ReactSeatMapModal.tsx

// file: /code/components/seatMap/ReactSeatMapModal.tsx

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
      const segments = pnrData.segments;
      const enriched = enrichPassengerData(pnrData.passengers);
      const enrichedPassengers = enriched.enrichedPassengers;

      setPassengers(enrichedPassengers);
      setSelectedPassengerId(enrichedPassengers[0]?.id || '');
      setSegments(segments);

        // 🪑 Инициализируем selectedSeats из PNR
        const assignedSeatsFromPnr = enrichedPassengers
            .filter(p => p.seatAssignment && p.seatAssignment !== 'not assigned')
            .map(p => ({
                passengerId: p.id,
                seatLabel: p.seatAssignment,
                confirmed: true,
                price: 0,
                passengerInitials: p.passengerInitials,
                passengerColor: p.passengerColor,
            }));
        setSelectedSeats(assignedSeatsFromPnr);

        const flightSegment = segments[0];
        const defaultCabin = ['F', 'C', 'S', 'Y'].includes(flightSegment.bookingClass)
            ? flightSegment.bookingClass
        : 'Y';
      setCabinClass(defaultCabin as any);

      await fetchSeatMap(segments, 0, defaultCabin as any, enrichedPassengers);
    };

    fetchData();
  }, []);

  React.useEffect(() => {
    if (segments.length && passengers.length) {
      fetchSeatMap(segments, segmentIndex, cabinClass, passengers);
    }
  }, [segmentIndex, cabinClass]);

  React.useEffect(() => {
    if (rows.length > 0 && !selectedDeck) {
      setSelectedDeck(rows[0].deckId || 'Maindeck');
    }
  }, [rows]);

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
          selectedSeats={selectedSeats}
          selectedPassengerId={selectedPassengerId}
          setSelectedPassengerId={setSelectedPassengerId}
          setSelectedSeats={setSelectedSeats}
          assignedSeats={[]} // заглушка
          config={{}}
          flight={{} as FlightData}
          availability={flightInfo?.availability || []}
          iframeRef={{ current: null }}
          handleResetSeat={() => setSelectedSeats([])}
          handleSave={() => console.log('💾 Save clicked')}
          handleAutomateSeating={() => console.log('🤖 Auto assign clicked')}
          saveDisabled={false}
        />
      }
      center={
        <FallbackSeatmapCenter
          passengers={passengers}
          selectedPassengerId={selectedPassengerId}
          selectedSeats={selectedSeats}
          setSelectedSeats={setSelectedSeats}
          rows={rows}
          layoutLength={layoutLength}
          selectedDeck={selectedDeck}
          setSelectedDeck={setSelectedDeck}
        />
      }
      legendPanel={<SeatLegend />}
    />
  );
};

export default ReactSeatMapModal;