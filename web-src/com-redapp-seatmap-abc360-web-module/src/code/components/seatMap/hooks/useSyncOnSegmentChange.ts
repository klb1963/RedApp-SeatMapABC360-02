// file: code/components/seatMap/hooks/useSyncOnSegmentChange.ts

/**
 * useSyncOnSegmentChange.ts
 * 
 * 🔁 React hook that synchronizes the seat map content when the selected flight segment changes.
 * 
 * Responsibilities:
 * - Sends already prepared flight data and passenger payload for the new segment
 * - Builds a SeatMapMessagePayload including updated config, flight, availability, and passengers
 * - Sends the payload to the SeatMap iframe via postMessage
 * 
 * Triggered automatically when `segmentIndex` changes.
 * Keeps the seat map view aligned with the currently selected segment.
 */

import { useEffect } from 'react';
import { PassengerOption } from '../../../utils/parsePnrData';
import { FlightData } from '../../../utils/generateFlightData';
import { createPassengerPayload } from '../helpers/createPassengerPayload';
import { SeatMapMessagePayload } from '../types/SeatMapMessagePayload';
import { SelectedSeat } from '../types/types';

interface Props {
  config: any;
  segment: any;
  segmentIndex: number;
  cabinClass: string;
  mappedCabinClass: 'E' | 'P' | 'B' | 'F' | 'A';
  availability: any[];
  passengers: PassengerOption[];
  selectedPassengerId: string;
  selectedSeats: SelectedSeat[];
  iframeRef: React.RefObject<HTMLIFrameElement>;
  flightData: FlightData; // 🆕 precomputed flightData
  startRowOverride?: string;
  endRowOverride?: string;
}

export const useSyncOnSegmentChange = ({
  config,
  segment,
  segmentIndex,
  cabinClass,
  mappedCabinClass,
  availability,
  passengers,
  selectedPassengerId,
  selectedSeats,
  iframeRef,
  flightData,
  startRowOverride,
  endRowOverride
}: Props) => {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (!flightData || !availability?.length) {
      console.log('⏳ Flight data or availability not ready yet');
      return;
    }

    const availabilityData = availability || [];

    const passengerList = passengers.map((p, index) =>
      createPassengerPayload(p, index, selectedPassengerId, selectedSeats)
    );

    const finalFlightData = {
      ...flightData,
      startRow: startRowOverride ?? flightData.startRow,
      endRow: endRowOverride ?? flightData.endRow,
    };

    const message: SeatMapMessagePayload = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(finalFlightData),
      currentDeckIndex: '0',
      availability: JSON.stringify(availabilityData),
      passengers: JSON.stringify(passengerList)
    };

    console.log('[🚀 passengerList sent to iframe - segment change]', passengerList);

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('📤 Seat map updated after segment change');
  }, [segmentIndex]);
};