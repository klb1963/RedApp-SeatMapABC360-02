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
  passengerInitials: string;
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

  const seatMapInitError = useSeatMapInitErrorLogger();
  const useFallback = isFallbackMode();
  const showFallback = useFallback || !!seatMapInitError;

  const mappedCabinClass = useMemo(() => {
    return mapCabinToCode(cabinClass);
  }, [cabinClass]);

  useEffect(() => {
    setSegmentIndex(initialSegmentIndex);
  }, [initialSegmentIndex]);

  useEffect(() => {
    setAlreadyInitialized(false);
  }, [initialSegmentIndex]);

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

  const passengerPanel = showFallback ? null : (
    <PassengerPanel
      passengers={cleanPassengers}
      selectedSeats={selectedSeats}
      selectedPassengerId={selectedPassengerId}
      setSelectedPassengerId={setSelectedPassengerId}
      handleResetSeat={() => {}}
      handleSave={() => {}}
      saveDisabled={false}
      assignedSeats={assignedSeats}
      handleAutomateSeating={() => {}}
      setSelectedSeats={setSelectedSeats}
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
        {showFallback ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              width: '100%',
              height: '100%',
              overflow: 'auto',
              paddingLeft: '2rem',
              paddingRight: '4rem',
            }}
          >
            <div style={{ minWidth: 720 }}>
              <ReactSeatMapModal/>
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