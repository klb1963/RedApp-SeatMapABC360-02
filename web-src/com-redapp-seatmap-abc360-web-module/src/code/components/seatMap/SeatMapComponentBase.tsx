// file: /code/components/seatMap/SeatMapComponentBase.tsx

/**
 * SeatMapComponentBase.tsx
 *
 * ✈️ Main React component for rendering the Seat Map ABC 360 modal.
 *
 * Responsibilities:
 * - Initializes and synchronizes seat map data with the Quicket iframe.
 * - Manages passenger list, seat selection, and segment/cabin changes.
 * - Handles Save, Reset, Auto-Assign, Delete actions for seats.
 * - Shows fallback mode UI when iframe initialization fails.
 *
 * Used as the base building block for the seat map modal in Sabre RedApp.
 */

import * as React from 'react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { FlightData } from '../../utils/generateFlightData';
import SeatMapModalLayout from './layout/SeatMapModalLayout';
import { PassengerOption } from '../../utils/parsePnrData';

import { useSyncOnSegmentChange } from './hooks/useSyncOnSegmentChange';
import { useSyncOnCabinClassChange } from './hooks/useSyncOnCabinClassChange';
import { useOnIframeLoad } from './hooks/useOnIframeLoad';
import { useSeatSelectionHandler } from './hooks/useSeatSelectionHandler';

import { PassengerPanel } from './panels/PassengerPanel';
import { GalleryPanel } from './panels/GalleryPanel';

import { createSelectedSeat } from './helpers/createSelectedSeat';
import { handleSaveSeats } from './handleSaveSeats';
import { handleDeleteSeats } from './handleDeleteSeats';
import { postSeatMapUpdate } from './helpers/postSeatMapUpdate';
import { handleAutomateSeating } from './handleAutomateSeating';

import { mapCabinToCode } from '../../utils/mapCabinToCode';
import { useSeatMapInitErrorLogger } from './hooks/useSeatMapInitErrorLogger';
import ReactSeatMapModal from './ReactSeatMapModal';
import { isFallbackMode } from './utils/isFallbackMode';
import { useSeatmapMedia } from './hooks/useSeatmapMedia';
import { getGalleryConfig } from '../../utils/galleryConfig';

// Global type for debugging support
declare global {
  interface Window {
    selectedSeats?: SelectedSeat[];
  }
}

// SelectedSeat describes a single passenger’s seat assignment
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

// Component props
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
  flightInfo?: React.ReactNode;
  galleryPanel?: React.ReactNode;
  legendPanel?: React.ReactNode;
}

// Ensures each passenger has a unique id and fallback value
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
  legendPanel
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [cleanPassengers] = useState(() => ensurePassengerIds(passengers));
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [alreadyInitialized, setAlreadyInitialized] = useState(false);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');
  const [segmentIndex, setSegmentIndex] = useState(initialSegmentIndex);
  const segment = flightSegments[segmentIndex];

  const seatMapInitError = useSeatMapInitErrorLogger();
  const useFallback = isFallbackMode();
  const showFallback = useFallback || !!seatMapInitError;

  const mappedCabinClass = useMemo(() => mapCabinToCode(cabinClass), [cabinClass]);
  const { media } = useSeatmapMedia();
  const galleryConfig = useMemo(() => getGalleryConfig(media), [media]);

  // Reset state when segment index changes
  useEffect(() => {
    setSegmentIndex(initialSegmentIndex);
    setAlreadyInitialized(false);
  }, [initialSegmentIndex]);

  // Populate initially assigned seats
  useEffect(() => {
    if (assignedSeats?.length && !alreadyInitialized) {
      const enriched = assignedSeats.map(s => {
        const pax = passengers.find(p => String(p.id) === String(s.passengerId) || String(p.nameNumber) === String(s.passengerId));
        if (!pax) return null;
        return createSelectedSeat(pax, s.seat, true, availability);
      }).filter(Boolean) as SelectedSeat[];

      setSelectedSeats(enriched);
      onSeatChange?.(enriched);
      setAlreadyInitialized(true);
    }
  }, [assignedSeats, passengers, availability, alreadyInitialized]);

  // Make seats globally debuggable
  useEffect(() => {
    window.selectedSeats = selectedSeats;
  }, [selectedSeats]);

  // Select first passenger if none selected yet
  useEffect(() => {
    if (cleanPassengers.length > 0 && !selectedPassengerId) {
      setSelectedPassengerId(String(cleanPassengers[0].id));
    }
  }, [passengers, selectedPassengerId]);

  // Hooks for synchronizing seat map iframe
  const handleIframeLoad = useOnIframeLoad({ iframeRef, config, segment, initialSegmentIndex, cabinClass, availability, cleanPassengers, selectedPassengerId, selectedSeats, generateFlightData });
  useSyncOnCabinClassChange({ iframeRef, config, segment, initialSegmentIndex, cabinClass, mappedCabinClass, availability, cleanPassengers, selectedPassengerId, selectedSeats });
  useSyncOnSegmentChange({ config, segment, initialSegmentIndex, cabinClass, mappedCabinClass, availability, passengers: cleanPassengers, selectedPassengerId, selectedSeats, iframeRef, generateFlightData });
  useSeatSelectionHandler({ cleanPassengers, selectedPassengerId, setSelectedPassengerId, setSelectedSeats, onSeatChange, availability });

  /**
   * Automatically assigns available seats to passengers and updates iframe.
   */
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

  /**
   * Saves current seat assignments by deleting and reassigning them in Sabre.
   */
  const onSaveSeats = async () => {
    await handleDeleteSeats(async () => {
      await handleSaveSeats(selectedSeats);
    });
  };

  // Passenger panel shown in the right column
  const passengerPanel = showFallback ? null : (
    <PassengerPanel
      passengers={cleanPassengers}
      selectedSeats={selectedSeats}
      selectedPassengerId={selectedPassengerId}
      setSelectedPassengerId={setSelectedPassengerId}
      handleResetSeat={() => {}}
      handleSave={onSaveSeats}
      saveDisabled={false}
      assignedSeats={assignedSeats}
      handleAutomateSeating={onAutomateSeating}
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
      galleryPanel={<GalleryPanel config={galleryConfig} />}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', overflow: 'auto' }}>
        {showFallback ? (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%', height: '100%', overflow: 'auto', paddingLeft: '2rem', paddingRight: '4rem' }}>
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