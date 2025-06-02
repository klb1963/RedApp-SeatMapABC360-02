// file: /code/components/seatMap/SeatMapComponentBase.tsx

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
import { createSelectedSeat } from './helpers/createSelectedSeat';
import { areSeatsEqual } from './helpers/areSeatsEqual';
import { handleSaveSeats } from './handleSaveSeats';
import { handleDeleteSeats } from './handleDeleteSeats';
import { postSeatMapUpdate } from './helpers/postSeatMapUpdate';
import { handleAutomateSeating } from './handleAutomateSeating';
import { mapCabinToCode } from '../../utils/mapCabinToCode';

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
  initialSegmentIndex = 0, // first segment
  cabinClass,
  availability,
  passengers,
  generateFlightData,
  onSeatChange,
  flightInfo,
  assignedSeats,
  galleryPanel
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [cleanPassengers] = useState(() => ensurePassengerIds(passengers));
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [alreadyInitialized, setAlreadyInitialized] = useState(false);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');
  const [segmentIndex, setSegmentIndex] = React.useState(initialSegmentIndex);
  const segment = flightSegments[segmentIndex];

  React.useEffect(() => {
    setSegmentIndex(initialSegmentIndex);
  }, [initialSegmentIndex]);

  // Initialize Segment
  useEffect(() => {
    setAlreadyInitialized(false);
  }, [initialSegmentIndex]);

  // Initialize selectedSeats from assignedSeats if not already initialized
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

  // Sync selected seats to window for debug
  useEffect(() => {
    window.selectedSeats = selectedSeats;
  }, [selectedSeats]);

  // Auto-select first passenger
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
      availability &&
      !alreadyInitialized
    ) {
      // 🔁 Convert cabin code (e.g., 'Y', 'C') to mapped value expected by visualization (e.g., 'E', 'B')
      const mappedCabin = mapCabinToCode(cabinClass);

      // ✈️ Generate structured flight data based on segment and mapped cabin class
      const flight = generateFlightData(segment, segmentIndex, mappedCabin);
      if (!flight) {
        console.warn('🛑 Skipping update – flight data is null');
        return;
      }

      // 📤 Send data to SeatMap iframe
      postSeatMapUpdate({
        config,
        flight,
        availability,
        passengers: cleanPassengers,
        selectedPassengerId,
        selectedSeats,
        iframeRef
      });

      // ✅ Prevent multiple re-renders
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

  // 🔄 Fallback update on cabin or segment change
  useEffect(() => {
    if (!iframeRef.current) return;

    // 🧭 Convert Sabre cabin class (e.g., 'Y', 'C') to visualization code (e.g., 'E', 'B')
    const mappedCabin = mapCabinToCode(cabinClass);

    // ✈️ Generate updated flight data based on new segment or cabin
    if (!segment) {
      console.warn('🛑 No segment data – skipping postMessage on cabin or segment change');
      return;
    }
    const flight = generateFlightData(segment, segmentIndex, mappedCabin);

    // 📤 Push updated data to SeatMap iframe
    postSeatMapUpdate({
      config,
      flight,
      availability,
      passengers: cleanPassengers,
      selectedPassengerId,
      selectedSeats,
      iframeRef
    });
  }, [segmentIndex, cabinClass]);

  // 🔄 Resets all selected seats and reinitializes the SeatMap iframe
  const handleResetSeat = () => {
    // 🔁 Clear all selected seats
    setSelectedSeats([]);

    // 🎯 Reset selected passenger to the first in the list (if available)
    setSelectedPassengerId(cleanPassengers.length > 0 ? cleanPassengers[0].id : '');

    // 📭 Notify parent about seat reset
    onSeatChange?.([]);

    const iframe = iframeRef.current;
    if (!iframe) return;

    // 🧭 Convert Sabre cabin class to library-specific code
    const mappedCabin = mapCabinToCode(cabinClass);

    console.log('!!!🧩🧩🧩 generateFlightData input:', segment) 

    // ✈️ Generate updated flight data
    if (!segment) {
      console.warn('🛑 No segment data – skipping postMessage in automateSeating');
      return;
    }
    const flight = generateFlightData(segment, segmentIndex, mappedCabin);

    // 📦 Build passenger payload for iframe
    const passengerList = cleanPassengers.map((p, i) =>
      createPassengerPayload(p, i, selectedPassengerId, [])
    );

    // 📨 Construct postMessage payload
    const message: SeatMapMessagePayload = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      availability: JSON.stringify(availability || []),
      passengers: JSON.stringify(passengerList),
      currentDeckIndex: '0'
    };

    // 🚀 Send data to iframe
    iframe.contentWindow?.postMessage(message, 'https://quicket.io');
  };

  // onLoad handler passed to iframe
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

  const handleSave = () => {
    handleSaveSeats(selectedSeats);
  };

  // 🤖 Automatically assigns free seats to passengers and updates the map
  const onAutomateSeating = () => {
    // 🪑 Auto-assign seats using helper logic
    const newSeats = handleAutomateSeating({
      passengers: cleanPassengers,
      availableSeats: availability
    });

    // 💾 Update internal state
    setSelectedSeats(newSeats);
    setSelectedPassengerId(String(cleanPassengers[0].id));

    // 📭 Notify parent about seat selection
    onSeatChange?.(newSeats);

    // 🧭 Map Sabre cabin code to library-specific cabin code
    const mappedCabin = mapCabinToCode(cabinClass);

    // ✈️ Generate flight data with mapped cabin class
    if (!segment) {
      console.warn('🛑 No segment data – skipping postMessage in automateSeating');
      return;
    }
    const flight = generateFlightData(segment, segmentIndex, mappedCabin);

    // 🚀 Push updated data to SeatMap iframe
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

  const passengerPanel = (
    <PassengerPanel
      passengers={cleanPassengers}
      selectedSeats={selectedSeats}
      selectedPassengerId={selectedPassengerId}
      setSelectedPassengerId={setSelectedPassengerId}
      handleResetSeat={handleResetSeat}
      handleSave={handleSave}
      saveDisabled={saveDisabled}
      assignedSeats={assignedSeats}
      handleDeleteSeats={handleDeleteSeats}
      handleAutomateSeating={onAutomateSeating}
    />
  );

  return (
    <SeatMapModalLayout
      flightInfo={flightInfo}
      passengerPanel={passengerPanel}
      galleryPanel={<GalleryPanel />}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', overflow: 'auto' }}>
        <iframe
          ref={iframeRef}
          title="Seat Map"
          src="https://quicket.io/react-proxy-app/"
          onLoad={handleIframeLoad}
          style={{ width: '460px', height: '100%', border: 'none', overflow: 'hidden' }}
        />
      </div>
    </SeatMapModalLayout>
  );
};

export default SeatMapComponentBase;