// file: /code/components/seatMap/SeatMapComponentBase.tsx

/**
 * SeatMapComponentBase.tsx
 * 
 * 🎯 Core Seat Map Wrapper Component – RedApp ABC360
 * 
 * This component wraps the external SeatMap rendering iframe (quicket.io) and manages:
 * - Mapping passenger data to visual payload
 * - Selecting passengers and tracking their assigned seats
 * - Posting data into the iframe via postMessage
 * - Handling deck/class/segment changes and seat selections
 * 
 * Acts as a central data bridge between Sabre PNR/availability data and the SeatMap visualization engine.
 */

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
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

// Global type declaration for optional debug use
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
  seat: {
    seatLabel: string;
    price: string;
  };
}

interface SeatMapComponentBaseProps {
  config: any;
  flightSegments: any[];
  initialSegmentIndex: number;
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
}

// 🧮 Ensure each passenger has unique id and value fields
function ensurePassengerIds(passengers: PassengerOption[]): PassengerOption[] {
  return passengers.map((p, index) => ({
    ...p,
    id: typeof p.id === 'string' && p.id.trim() !== '' ? p.id : `pax-${index}`,
    value: typeof p.value === 'string' && p.value.trim() !== '' ? p.value : `pax-${index}`
  }));
}

// === Main Component ===
const SeatMapComponentBase: React.FC<SeatMapComponentBaseProps> = ({
  config,
  flightSegments,
  initialSegmentIndex,
  cabinClass,
  availability,
  passengers,
  generateFlightData,
  onSeatChange,
  flightInfo,
  assignedSeats,
  galleryPanel
}) => {

  const iframeRef = useRef<HTMLIFrameElement>(null); // reference to the iframe
  const [boardingComplete, setBoardingComplete] = useState(false); // boarding status

  // ✅ Normalize passenger IDs on initial load
  const [cleanPassengers] = useState(() => ensurePassengerIds(passengers));

  //===================================================
  // 🪑 State for selected seats — начальная пустая инициализация
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  // ✅ Если selectedSeats пустой, но есть assignedSeats — инициализируем selectedSeats
  useEffect(() => {
    if (selectedSeats.length === 0 && assignedSeats?.length) {
      const enriched = assignedSeats.map((s) => {
        const pax = passengers.find(
          (p) => p.id === s.passengerId || p.nameNumber === s.passengerId
        );

        const fullName = pax?.label || '';
        const initials = pax
          ? `${pax.givenName?.[0] || ''}${pax.surname?.[0] || ''}`.toUpperCase()
          : '';
        const abbr = pax?.surname?.slice(0, 2).toUpperCase() || '';
        const passengerColor = pax?.passengerColor || '';

        return {
          passengerId: s.passengerId,
          seatLabel: s.seat,
          passengerType: 'ADT',
          passengerLabel: fullName,
          passengerColor,
          initials,
          abbr,
          readOnly: true,
          seat: {
            seatLabel: s.seat,
            price: 'USD 0',
          },
        };
      });

      setSelectedSeats(enriched);
      onSeatChange?.(enriched);
      console.log('🪑 selectedSeats инициализированы из assignedSeats');
    }
  }, [assignedSeats, selectedSeats.length, passengers]);

  //===================================================

  // 🔁 Sync selected seats to a global variable for debugging/testing
  useEffect(() => {
    window.selectedSeats = selectedSeats;
  }, [selectedSeats]);

  // 🎯 Track which passenger is currently selected
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');

  // ✅ Auto-select the first passenger on mount
  useEffect(() => {
    if (cleanPassengers.length > 0 && !selectedPassengerId) {
      const firstId = String(cleanPassengers[0].id);
      setSelectedPassengerId(firstId);
      console.log('👤 selectedPassengerId initiated:', firstId);
    }
  }, [passengers, selectedPassengerId]);

  const segment = flightSegments[initialSegmentIndex]; // selected segment

  // 🔁 Reset seat selection and post a full update to the iframe
  const handleResetSeat = () => {
    setSelectedSeats([]);
    setSelectedPassengerId(cleanPassengers.length > 0 ? cleanPassengers[0].id : '');
    onSeatChange?.([]);
    setBoardingComplete(false);

    const iframe = iframeRef.current;
    if (!iframe) return;

    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const availabilityData = availability || [];

    // ⛔️ reset seats
    const passengerList = cleanPassengers.map((p, i) =>
      createPassengerPayload(p, i, selectedPassengerId, []) 
    );

    const message: SeatMapMessagePayload = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      availability: JSON.stringify(availabilityData),
      passengers: JSON.stringify(passengerList),
      currentDeckIndex: '0'
    };

    const targetOrigin = 'https://quicket.io';
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('🔁 PostMessage after Reset all');
  };

  // === 🗺️ Initial iframe load handler (fires onLoad) ===
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

  // === 🔁 Sync on cabin class change ===
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

  // === 🔁 Sync on segment change ===
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

  // === 🎯 Handle iframe message events (seat selection) ===
  useSeatSelectionHandler({
    cleanPassengers,
    selectedPassengerId,
    setSelectedPassengerId,
    setSelectedSeats,
    setBoardingComplete,
    onSeatChange
  });
  
  // === 👥 Passenger control panel ===
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

  // === 📤 Render layout with iframe and passenger info ===
  return (
    <SeatMapModalLayout
      flightInfo={flightInfo}
      passengerPanel={passengerPanel}
      galleryPanel={<GalleryPanel />} // 👈 GalleryPanel
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
        <iframe
          ref={iframeRef}
          title="Seat Map"
          src="https://quicket.io/react-proxy-app/"
          onLoad={handleIframeLoad}
          style={{
            width: '460px', 
            height: '100%',
            border: 'none',
            overflow: 'hidden' 
           }}
        />
      </div>
    </SeatMapModalLayout>
  );

};

export default SeatMapComponentBase;