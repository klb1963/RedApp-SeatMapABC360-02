// file: SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { FlightData } from '../../utils/generateFlightData';
import SeatMapModalLayout from './layout/SeatMapModalLayout';
import { PassengerOption } from '../../utils/parcePnrData';
import { createPassengerPayload } from './helpers/createPassengerPayload';
import { SeatMapMessagePayload } from './types/SeatMapMessagePayload';
import { useSyncOnSegmentChange } from './hooks/useSyncOnSegmentChange';
import { useSyncOnCabinClassChange } from './hooks/useSyncOnCabinClassChange';
import { useOnIframeLoad } from './hooks/useOnIframeLoad';
import { useSeatSelectionHandler } from './hooks/useSeatSelectionHandler';
import { PassengerPanel } from './panels/PassengerPanel';

// global variable 
declare global {
  interface Window {
    selectedSeats?: SelectedSeat[];
  }
}

export interface SelectedSeat {
  passengerId: string;
  seatLabel: string;
}

interface SeatMapComponentBaseProps {
  config: any;
  flightSegments: any[];
  initialSegmentIndex: number;
  showSegmentSelector?: boolean;
  cabinClass: string;
  availability: any[];
  passengers: PassengerOption[];
  generateFlightData: (segment: any, index: number, cabin: string) => FlightData;
  onSeatChange?: (seats: SelectedSeat[]) => void;
  passengerPanel?: React.ReactNode;
  selectedSeats?: SelectedSeat[];
  flightInfo?: React.ReactNode;
}

// 📌 Indexing passengers
function ensurePassengerIds(passengers: PassengerOption[]): PassengerOption[] {
  return passengers.map((p, index) => ({
    ...p,
    id: typeof p.id === 'string' && p.id.trim() !== '' ? p.id : `pax-${index}`,
    value: typeof p.value === 'string' && p.value.trim() !== '' ? p.value : `pax-${index}`
  }));
}

// === Component ===
const SeatMapComponentBase: React.FC<SeatMapComponentBaseProps> = ({
  config,
  flightSegments,
  initialSegmentIndex,
  cabinClass,
  availability,
  passengers,
  generateFlightData,
  onSeatChange,
  flightInfo
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // tracking the boardingComplete
  const [boardingComplete, setBoardingComplete] = useState(false);

  // ✅ Provide correct and unique string IDs for passengers
  const [cleanPassengers] = useState(() => ensurePassengerIds(passengers));

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  // 🔁 Sync selectedSeats with global window
  useEffect(() => {
    window.selectedSeats = selectedSeats;
  }, [selectedSeats]);

  // selectedPassengerId изначально пустой
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');

  // ✅ Set the first passenger as selected when the array appears
  useEffect(() => {
    if (cleanPassengers.length > 0 && !selectedPassengerId) {
      const firstId = String(cleanPassengers[0].id);
      setSelectedPassengerId(firstId);
      console.log('👤 selectedPassengerId initiated:', firstId);
    }
  }, [passengers, selectedPassengerId]);

  const segment = flightSegments[initialSegmentIndex];

  const handleResetSeat = () => {
    setSelectedSeats([]);
    setSelectedPassengerId(cleanPassengers.length > 0 ? cleanPassengers[0].id : '');
    onSeatChange?.([]);
    setBoardingComplete(false);

    // 🔁 Updating the map - all seats reset
    const iframe = iframeRef.current;
    if (!iframe) return;

    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const availabilityData = availability || [];

    const passengerList = cleanPassengers.map((p, i) =>
      createPassengerPayload(p, i, selectedPassengerId, selectedSeats)
    );

    const message: SeatMapMessagePayload  = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      availability: JSON.stringify(availabilityData),
      passengers: JSON.stringify(passengerList),
      currentDeckIndex: '0'
    };

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('🔁 PostMessage после Reset all');

  };

  // ======== 🗺️ initial map loading ==================
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


  // ============ 🔁 SyncOnCabinClassChange ===================
  useSyncOnCabinClassChange({
    iframeRef,
    config,
    segment,
    initialSegmentIndex,
    cabinClass,
    availability,
    cleanPassengers,
    selectedPassengerId,
    selectedSeats
  });

  // =========== 🔁 SyncOnSegmentChange ========================
  useSyncOnSegmentChange({
    config,
    segment,
    initialSegmentIndex,
    cabinClass,
    availability,
    passengers: cleanPassengers,
    selectedPassengerId,
    selectedSeats,
    iframeRef,
    generateFlightData
  });

  // ============= SeatSelectionHandler =====================
  useSeatSelectionHandler({
    cleanPassengers,
    selectedPassengerId,
    setSelectedPassengerId,
    setSelectedSeats,
    setBoardingComplete,
    onSeatChange
  });

  // ============== Passengers =====================
  const passengerPanel = (
    <PassengerPanel
      passengers={cleanPassengers}
      selectedSeats={selectedSeats}
      selectedPassengerId={selectedPassengerId}
      setSelectedPassengerId={setSelectedPassengerId}
      handleResetSeat={handleResetSeat}
      boardingComplete={boardingComplete}
    />
  );

  // ============== show Seat Map =====================
  return (
    <SeatMapModalLayout
      flightInfo={flightInfo}
      passengerPanel={passengerPanel}

    >
      <iframe
        ref={iframeRef}
        title="Seat Map"
        src="https://quicket.io/react-proxy-app/"
        onLoad={handleIframeLoad}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </SeatMapModalLayout>
  );

};

export default SeatMapComponentBase;