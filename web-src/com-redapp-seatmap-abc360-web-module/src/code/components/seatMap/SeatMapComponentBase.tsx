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
  flightInfo?: React.ReactNode;
  galleryPanel?: React.ReactNode;
  legendPanel?: React.ReactNode;
  disableCabinClassChange?: boolean;

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
  segmentIndex = 0,
  segmentNumber,
  cabinClass,
  availability,
  passengers,
  flightData,
  onSeatChange,
  flightInfo,
  assignedSeats,
  legendPanel,
  disableCabinClassChange = false

}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [cleanPassengers] = useState(() => ensurePassengerIds(passengers));
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [alreadyInitialized, setAlreadyInitialized] = useState(false);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');

  const segment = flightSegments[segmentIndex];

  const seatMapInitError = useSeatMapInitErrorLogger();
  const showFallback = isFallbackMode() || seatMapInitError;

  const mappedCabinClass = useMemo(() => mapCabinToCode(cabinClass), [cabinClass]);
  const { media } = useSeatmapMedia();
  const galleryConfig = useMemo(() => getGalleryConfig(media), [media]);

  useEffect(() => {
    setAlreadyInitialized(false);
  }, [segmentIndex]);

  useEffect(() => {
    if (assignedSeats?.length && !alreadyInitialized) {
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

      setSelectedSeats(enriched);
      onSeatChange?.(enriched);
      setAlreadyInitialized(true);
    }
  }, [
    assignedSeats,
    passengers,
    availability,
    alreadyInitialized,
    flightSegments,
    segmentIndex,
    segment?.segmentNumber,
  ]);

  useEffect(() => {
    window.selectedSeats = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
    if (cleanPassengers.length > 0 && !selectedPassengerId) {
      setSelectedPassengerId(String(cleanPassengers[0].id));
    }
  }, [passengers, selectedPassengerId]);

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

  useSeatSelectionHandler({
    cleanPassengers,
    selectedPassengerId,
    setSelectedPassengerId,
    setSelectedSeats,
    onSeatChange,
    availability,
    segmentNumber
  });

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

  const onSaveSeats = async () => {
    await handleDeleteSeats(async () => {
      await handleSaveSeats(selectedSeats, currentSegmentNumber);
    });
  };

  const passengerPanel = showFallback ? null : (
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
  );

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