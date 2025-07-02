// file: /code/components/seatMap/SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { FlightData } from '../../utils/generateFlightData';
import SeatMapModalLayout from './layout/SeatMapModalLayout';
import { PassengerOption } from '../../utils/parsePnrData';
import { createPassengerPayload } from './helpers/createPassengerPayload';
import { SeatMapMessagePayload } from './types/SeatMapMessagePayload';
import { useSyncOnSegmentChange } from './hooks/useSyncOnSegmentChange';
import { useSyncOnCabinClassChange } from './hooks/useSyncOnCabinClassChange';
import { useOnIframeLoad } from './hooks/useOnIframeLoad';
import { useSeatSelectionHandler } from './hooks/useSeatSelectionHandler';
import { PassengerPanel } from './panels/PassengerPanel';
import { GalleryPanel } from './panels/GalleryPanel';
import { createSelectedSeat } from './helpers/createSelectedSeat';
import { areSeatsEqual } from './helpers/areSeatsEqual';
import { handleSaveSeats } from './handleSaveSeats';
import { handleDeleteSeats } from './handleDeleteSeats';
import { postSeatMapUpdate } from './helpers/postSeatMapUpdate';
import { handleAutomateSeating } from './handleAutomateSeating';
import { mapCabinToCode } from '../../utils/mapCabinToCode';
import { useSeatMapInitErrorLogger } from './hooks/useSeatMapInitErrorLogger';
import ReactSeatMapModal from './ReactSeatMapModal';
import { isFallbackMode } from './utils/isFallbackMode';

declare global {
  interface Window {
    selectedSeats?: SelectedSeat[];
  }
}

export interface SelectedSeat {
  passengerId: string;
  seatLabel: string;
  passengerType: string;
  passengerLabel: string;
  passengerColor: string;
  initials: string;
  readOnly?: boolean;
  abbr?: string;
  segmentNumber: string;
  seat: {
    seatLabel: string;
    price: string;
  };
}

interface SeatMapComponentBaseProps {
  config: any;
  flightSegments: any[];
  initialSegmentIndex?: number;
  showSegmentSelector?: boolean;
  cabinClass: string;
  availability: any[];
  passengers: PassengerOption[];
  assignedSeats?: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[];
  generateFlightData: (segment: any, index: number, cabin: string) => FlightData;
  onSeatChange?: (seats: SelectedSeat[]) => void;
  passengerPanel?: React.ReactNode;
  selectedSeats?: SelectedSeat[];
  flightInfo?: React.ReactNode;
  galleryPanel?: React.ReactNode;
  legendPanel?: React.ReactNode;
}

function ensurePassengerIds(passengers: PassengerOption[]): PassengerOption[] {
  return passengers.map((p, index) => ({
    ...p,
    id: typeof p.id === 'string' && p.id.trim() !== '' ? p.id : `pax-${index}`,
    value: typeof p.value === 'string' && p.value.trim() !== '' ? p.value : `pax-${index}`
  }));
}

const SeatMapComponentBase: React.FC<SeatMapComponentBaseProps> = ({
  config,
  flightSegments,
  initialSegmentIndex = 0,
  cabinClass,
  availability,
  passengers,
  generateFlightData,
  onSeatChange,
  flightInfo,
  assignedSeats,
  galleryPanel, 
  legendPanel
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [cleanPassengers] = useState(() => ensurePassengerIds(passengers));
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [alreadyInitialized, setAlreadyInitialized] = useState(false);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');
  const [segmentIndex, setSegmentIndex] = React.useState(initialSegmentIndex);
  const segment = flightSegments[segmentIndex];

  // turn On/Off fallBack seatMap React
  const useFallback = isFallbackMode();

  const mappedCabinClass = useMemo(() => {
    return mapCabinToCode(cabinClass);
  }, [cabinClass]);

  useEffect(() => {
    setSegmentIndex(initialSegmentIndex);
  }, [initialSegmentIndex]);

  useEffect(() => {
    setAlreadyInitialized(false);
  }, [initialSegmentIndex]);

  useSeatMapInitErrorLogger();

  useEffect(() => {
    if (assignedSeats?.length && !alreadyInitialized) {
      const enriched = assignedSeats.map((s) => {
        const pax = passengers.find((p) => String(p.id) === String(s.passengerId) || String(p.nameNumber) === String(s.passengerId));
        if (!pax) return null;
        return createSelectedSeat(pax, s.seat, true, availability);
      }).filter(Boolean) as SelectedSeat[];

      setSelectedSeats(enriched);
      onSeatChange?.(enriched);
      setAlreadyInitialized(true);
    }
  }, [assignedSeats, passengers, availability, alreadyInitialized]);

  useEffect(() => {
    window.selectedSeats = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
    if (cleanPassengers.length > 0 && !selectedPassengerId) {
      const firstId = String(cleanPassengers[0].id);
      setSelectedPassengerId(firstId);
    }
  }, [passengers, selectedPassengerId]);

  // 🧭 Initial map load effect – only runs once on first rendering
  useEffect(() => {
    if (
      iframeRef.current &&
      flightSegments.length > 0 &&
      cabinClass &&
      !alreadyInitialized
    ) {

      const effectiveCabin = segment?.bookingClass || mappedCabinClass;
      const flight = generateFlightData(segment, segmentIndex, mapCabinToCode(effectiveCabin));
      if (!flight) return;

      console.log('📤📤📤!!! Sending to seatmap iframe:', {
        flight,
        startRow: flight?.startRow,
        endRow: flight?.endRow,
        availability,
      });

      postSeatMapUpdate({
        config,
        flight,
        availability,
        passengers: cleanPassengers,
        selectedPassengerId,
        selectedSeats,
        iframeRef
      });

      setAlreadyInitialized(true);
    }
  }, [
    iframeRef.current,
    flightSegments,
    cabinClass,
    availability,
    segmentIndex,
    cleanPassengers,
    selectedPassengerId,
    selectedSeats,
    alreadyInitialized
  ]);

  // 🔁 Fallback update effect – triggers when segmentIndex or cabinClass changes,
// but only if no seats are currently selected.
// Prevents map from becoming stale after user changes flight segment or cabin dropdown manually.

  useEffect(() => {
    if (!iframeRef.current) return;
    if (selectedSeats.length > 0) return;

    const mappedCabin = mappedCabinClass;

    if (!segment) return;

    const effectiveCabin = segment?.bookingClass || mappedCabinClass;
    const flight = generateFlightData(segment, segmentIndex, mapCabinToCode(effectiveCabin));

    console.log('📤📤📤!!! Sending to seatmap iframe:', {
      flight,
      startRow: flight?.startRow,
      endRow: flight?.endRow,
      availability,
    });

    postSeatMapUpdate({
      config,
      flight,
      availability,
      passengers: cleanPassengers,
      selectedPassengerId,
      selectedSeats,
      iframeRef
    });
  }, [segmentIndex, cabinClass, selectedSeats.length]);

  // Reset Seat
  const handleResetSeat = () => {
    setSelectedSeats([]);
    setSelectedPassengerId(cleanPassengers.length > 0 ? cleanPassengers[0].id : '');
    onSeatChange?.([]);
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (!segment) return;
    const effectiveCabin = segment?.bookingClass || mappedCabinClass;
    const flight = generateFlightData(segment, segmentIndex, mapCabinToCode(effectiveCabin));

    const passengerList = cleanPassengers.map((p, i) =>
      createPassengerPayload(p, i, selectedPassengerId, [])
    );

    const message: SeatMapMessagePayload = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      currentDeckIndex: '0'
    };

    if (Array.isArray(availability) && availability.length > 0) {
      message.availability = JSON.stringify(availability);
    } else if (availability === null) {
      message.availability = null;
    }

    if (passengerList && passengerList.length > 0) {
      message.passengers = JSON.stringify(passengerList);
    }

    iframe.contentWindow?.postMessage(message, 'https://quicket.io');
  };

  const handleIframeLoad = useOnIframeLoad({
    iframeRef,
    config,
    segment,
    initialSegmentIndex,
    cabinClass,
    availability,
    cleanPassengers,
    selectedPassengerId,
    selectedSeats,
    generateFlightData
  });

  useSyncOnCabinClassChange({
    iframeRef,
    config,
    segment,
    initialSegmentIndex,
    cabinClass,
    mappedCabinClass,
    availability,
    cleanPassengers,
    selectedPassengerId,
    selectedSeats
  });

  useSyncOnSegmentChange({
    config,
    segment,
    initialSegmentIndex,
    cabinClass,
    mappedCabinClass,
    availability,
    passengers: cleanPassengers,
    selectedPassengerId,
    selectedSeats,
    iframeRef,
    generateFlightData
  });

  useSeatSelectionHandler({
    cleanPassengers,
    selectedPassengerId,
    setSelectedPassengerId,
    setSelectedSeats,
    onSeatChange,
    availability
  });

  const enrichedAssignedSeats: SelectedSeat[] = assignedSeats?.map((s) => {
    const pax = passengers.find((p) => p.id === s.passengerId || p.nameNumber === s.passengerId);
    if (!pax) return null;
    return createSelectedSeat(pax, s.seat, true, availability);
  }).filter(Boolean) as SelectedSeat[];

  const saveDisabled = assignedSeats ? areSeatsEqual(selectedSeats, enrichedAssignedSeats) : false;

  const handleSave = async () => {
    try {
      const { handleDeleteSeats } = await import('./handleDeleteSeats');
      await handleDeleteSeats(async () => {
        await handleSaveSeats(selectedSeats);
      });
    } catch (error) {
      console.error('❌ Ошибка при сохранении мест:', error);
      alert('❌ Ошибка при сохранении. См. консоль.');
    }
  };

  const onAutomateSeating = () => {
    const newSeats = handleAutomateSeating({
      passengers: cleanPassengers,
      availableSeats: Array.isArray(availability) ? availability : [],
      segmentNumber: segment?.segmentNumber || '1',
    });

    setSelectedSeats(newSeats);
    setSelectedPassengerId(String(cleanPassengers[0].id));

    const effectiveCabin = segment?.bookingClass || mappedCabinClass;
    const flight = generateFlightData(segment, segmentIndex, mapCabinToCode(effectiveCabin));

    postSeatMapUpdate({
      config,
      flight,
      availability,
      passengers: cleanPassengers,
      selectedPassengerId: String(cleanPassengers[0].id),
      selectedSeats: newSeats,
      iframeRef
    });
  };

  const passengerPanel = useFallback ? null : (
    <PassengerPanel
      passengers={cleanPassengers}
      selectedSeats={selectedSeats}
      selectedPassengerId={selectedPassengerId}
      setSelectedPassengerId={setSelectedPassengerId}
      handleResetSeat={handleResetSeat}
      handleSave={handleSave}
      saveDisabled={saveDisabled}
      assignedSeats={assignedSeats}
      handleAutomateSeating={onAutomateSeating}
      setSelectedSeats={setSelectedSeats}
      // 👇 вот эти 4 параметра — обязательны
      config={config}
      flight={generateFlightData(segment, segmentIndex, mapCabinToCode(segment?.bookingClass || mappedCabinClass))}
      availability={availability}
      iframeRef={iframeRef}
    />
  );

  return (
    <SeatMapModalLayout
      flightInfo={flightInfo}
      passengerPanel={passengerPanel}
      legendPanel={legendPanel}
      galleryPanel={<GalleryPanel />}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          overflow: 'auto',
        }}
      >
        {useFallback ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start', // или 'center', если нужно и по вертикали
              width: '100%',
              height: '100%',
              overflow: 'auto',
            }}
          >
            <div style={{ minWidth: 720 }}>
              <ReactSeatMapModal />
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            title="Seat Map"
            src="https://quicket.io/react-proxy-app/"
            onLoad={handleIframeLoad}
            style={{ width: '460px', height: '100%', border: 'none', overflow: 'hidden' }}
          />
        )}
      </div>
    </SeatMapModalLayout>
  );

};

export default SeatMapComponentBase;