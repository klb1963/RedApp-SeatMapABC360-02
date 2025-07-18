// file: /code/components/seatMap/SeatMapComponentBase.tsx

/**
 * SeatMapComponentBase.tsx
 *
 * React component for rendering the Seat Map modal.
 *
 * Responsibilities:
 * - Initializes and synchronizes seat map state with Quicket iframe.
 * - Manages passenger list, seat selection, and segment/cabin changes.
 * - Handles Save, Reset, Auto-Assign, Delete actions for seats.
 * - Displays fallback mode UI if iframe fails to initialize.
 *
 * Used as the base for the seat map modal in Sabre RedApp.
 */

import * as React from 'react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { FlightData } from '../../utils/generateFlightData';
import SeatMapModalLayout from './layout/SeatMapModalLayout';
import { PassengerOption } from '../../utils/parsePnrData';

import { useSyncOnSegmentChange } from './hooks/useSyncOnSegmentChange';
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

/**
 * Global window extension to expose selected seats for debugging.
 */
declare global {
  interface Window {
    selectedSeats?: SelectedSeat[];
  }
}

/**
 * Type representing a selected seat for a passenger on a specific segment.
 */
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

/**
 * Props for SeatMapComponentBase.
 * Defines the required configuration, data and callbacks.
 */
interface SeatMapComponentBaseProps {
  config: any;
  flightSegments: any[];
  segmentIndex?: number;
  segmentNumber?: string;
  showSegmentSelector?: boolean;
  cabinClass: string;
  availability: any[];
  passengers: PassengerOption[];
  assignedSeats?: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[];
  flightData: FlightData;
  onSeatChange?: (seats: SelectedSeat[]) => void;
  onAssignedSeatsChange?: (assignments: { passengerId: string; seat: string; segmentNumber: string }[]) => void;
  flightInfo?: React.ReactNode;
  galleryPanel?: React.ReactNode;
  legendPanel?: React.ReactNode;
  disableCabinClassChange?: boolean;
  allSelectedSeats: SelectedSeat[];
}

/**
 * Ensures each passenger has a unique id and value for selection.
 */
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
  segmentIndex = 0,
  segmentNumber,
  cabinClass,
  availability,
  passengers,
  flightData,
  onSeatChange,
  onAssignedSeatsChange,
  flightInfo,
  assignedSeats,
  legendPanel,
  disableCabinClassChange = false,
  allSelectedSeats,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ensure passengers have unique IDs for selection
  const [cleanPassengers] = useState(() => ensurePassengerIds(passengers));

  // Currently selected seats for this segment
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  // Currently selected passenger ID
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');

  const segment = flightSegments[segmentIndex];

  // Determine if fallback mode should be displayed
  const [useFallback, setUseFallback] = useState(isFallbackMode());

  useEffect(() => {
    console.log('+++ [SeatMap] +++ useFallback changed to', useFallback);
  }, [useFallback]);

  const seatMapInitError = useSeatMapInitErrorLogger();

  useEffect(() => {
    console.log('+++ [SeatMap] +++ seatMapInitError =', seatMapInitError);
    if (seatMapInitError) {
      console.warn('[SeatMap] Activating fallback due to seatMapInitError');
      setUseFallback(true);
    }
  }, [seatMapInitError]);

  const mappedCabinClass = useMemo(() => mapCabinToCode(cabinClass), [cabinClass]);
  const { media } = useSeatmapMedia();
  const galleryConfig = useMemo(() => getGalleryConfig(media), [media]);

  // Initialize assigned seats for current segment if provided
  useEffect(() => {
    if (assignedSeats?.length) {
      const currentSegmentNumber = String(segment?.segmentNumber || segmentIndex + 1);
  
      const enriched = assignedSeats
        .filter(s => String(s.segmentNumber) === currentSegmentNumber)
        .map(s => {
          const pax = passengers.find(
            p => String(p.id) === String(s.passengerId) || String(p.nameNumber) === String(s.passengerId)
          );
          if (!pax) return null;
  
          return createSelectedSeat(
            pax,
            s.seat,
            true,
            availability,
            currentSegmentNumber
          );
        })
        .filter(Boolean) as SelectedSeat[];
  
      // ✅ Compare the current and new values to avoid triggering setState unnecessarily
      const same =
        selectedSeats.length === enriched.length &&
        selectedSeats.every((s, i) => s.passengerId === enriched[i].passengerId && s.seatLabel === enriched[i].seatLabel);
  
      if (!same) {
        setSelectedSeats(enriched);
        onSeatChange?.(enriched);
      }
    }
  }, [
    assignedSeats,
    passengers,
    availability,
    flightSegments,
    segmentIndex,
    segment?.segmentNumber,
  ]);

  // Expose selected seats globally for debugging
  useEffect(() => {
    window.selectedSeats = selectedSeats;
  }, [selectedSeats]);

  // Auto-select first passenger if none selected yet
  useEffect(() => {
    if (cleanPassengers.length > 0 && !selectedPassengerId) {
      setSelectedPassengerId(String(cleanPassengers[0].id));
    }
  }, [passengers, selectedPassengerId]);

  // Initialize iframe and sync state when it loads
  const handleIframeLoad = useOnIframeLoad({
    iframeRef,
    config,
    segment,
    segmentIndex,
    cabinClass,
    availability,
    cleanPassengers,
    selectedPassengerId,
    selectedSeats,
    flightData
  });

  const currentAvailabilityForSegment =
    availability?.find(a => String(a.segmentNumber) === String(segment?.segmentNumber || segmentIndex + 1));

  const startRowOverride = currentAvailabilityForSegment?.startRow;
  const endRowOverride = currentAvailabilityForSegment?.endRow;

  // Sync state when segment changes
  useSyncOnSegmentChange({
    config,
    segment,
    segmentIndex,
    cabinClass,
    mappedCabinClass,
    availability,
    passengers: cleanPassengers,
    selectedPassengerId,
    selectedSeats,
    iframeRef,
    flightData,
    startRowOverride,
    endRowOverride
  });

  // Sync cabin class changes if allowed
  if (!disableCabinClassChange) {
    const { useSyncOnCabinClassChange } = require('./hooks/useSyncOnCabinClassChange');
    useSyncOnCabinClassChange({
      iframeRef,
      config,
      segment,
      segmentIndex,
      cabinClass,
      mappedCabinClass,
      availability,
      cleanPassengers,
      selectedPassengerId,
      selectedSeats
    });
  }

  const currentSegmentNumber = segmentNumber || String(segmentIndex + 1);

  const selectedSeatsForSegment = selectedSeats.filter(
    s => s.segmentNumber === currentSegmentNumber
  );

  // Handle passenger seat selection logic
  useSeatSelectionHandler({
    cleanPassengers,
    selectedPassengerId,
    setSelectedPassengerId,
    setSelectedSeats,
    onSeatChange,
    availability,
    segmentNumber
  });

  // Auto-assign seats for all passengers
  const onAutomateSeating = () => {
    const newSeats = handleAutomateSeating({
      passengers: cleanPassengers,
      availableSeats: Array.isArray(availability) ? availability : [],
      segmentNumber: currentSegmentNumber,
    });

    setSelectedSeats(newSeats);
    setSelectedPassengerId(String(cleanPassengers[0].id));

    postSeatMapUpdate({
      config,
      flight: flightData,
      availability,
      passengers: cleanPassengers,
      selectedPassengerId: String(cleanPassengers[0].id),
      selectedSeats: newSeats,
      iframeRef
    });
  };

  // Save all selected seats to PNR
  const onSaveSeats = async () => {
    if (!allSelectedSeats.length) {
      alert('⚠️ No seats selected.');
      return;
    }

    const seatAssignmentsForPNR = allSelectedSeats.map(s => ({
      passengerId: s.passengerId,
      seatLabel: s.seatLabel,
      segmentNumber: s.segmentNumber
    }));

    const seatAssignmentsForParent = allSelectedSeats.map(s => ({
      passengerId: s.passengerId,
      seat: s.seatLabel,
      segmentNumber: s.segmentNumber
    }));

    try {
      console.log('♻️ Clearing all seats in PNR before saving new assignments…');
      await handleDeleteSeats();

      console.log('💾 Saving all selected seats on all segments:\n', seatAssignmentsForPNR);
      await handleSaveSeats(seatAssignmentsForPNR);

      if (onAssignedSeatsChange) {
        onAssignedSeatsChange(seatAssignmentsForParent);
      }

      console.log('✅ Seats successfully reassigned on all segments.');
    } catch (error) {
      console.error('❌ Error during save seats flow:', error);
      alert('❌ Error saving seats. See console for details.');
    }
  };

  // Render passenger panel only for PNR-scenario
  const passengerPanel = passengers.length > 0 ? (
    <PassengerPanel
      passengers={cleanPassengers}
      selectedSeats={selectedSeatsForSegment}
      selectedPassengerId={selectedPassengerId}
      setSelectedPassengerId={setSelectedPassengerId}
      handleResetSeat={() => {
        setSelectedSeats([]);
        postSeatMapUpdate({
          config,
          flight: flightData,
          availability,
          passengers: cleanPassengers,
          selectedSeats: [],
          selectedPassengerId,
          iframeRef
        });
      }}
      handleSave={onSaveSeats}
      saveDisabled={false}
      assignedSeats={assignedSeats}
      handleAutomateSeating={onAutomateSeating}
      setSelectedSeats={setSelectedSeats}
      config={config}
      flight={flightData}
      availability={availability}
      iframeRef={iframeRef}
    />
  ) : null;

  if (useFallback) {
    return <ReactSeatMapModal />;
  }

  return (
    <SeatMapModalLayout
      flightInfo={flightInfo}
      passengerPanel={passengerPanel}
      legendPanel={legendPanel}
      galleryPanel={<GalleryPanel config={galleryConfig} />}
      hasPassengers={passengers.length > 0}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
          overflow: 'auto'
        }}
      >
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