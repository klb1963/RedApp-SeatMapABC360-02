// file: code/components/seatMap/hooks/useOnIframeLoad.ts

/**
 * useOnIframeLoad.ts
 * 
 * 📤 Custom React hook to initialize the seat map iframe when it finishes loading.
 * 
 * Responsibilities:
 * - Sends already prepared flight data and passenger list to the iframe
 * - Builds a SeatMapMessagePayload object containing config, flight, availability, and passengers
 * - Sends the payload to the iframe via postMessage once it's ready
 * 
 * This hook ensures that the external SeatMap rendering library receives all necessary data
 * immediately after the iframe becomes available.
 */

import { useCallback } from 'react';
import { PassengerOption } from '../../../utils/parsePnrData';
import { FlightData } from '../../../utils/generateFlightData';
import { SeatMapMessagePayload } from '../types/SeatMapMessagePayload';
import { createPassengerPayload } from '../helpers/createPassengerPayload';
import { SelectedSeat } from '../types/types';

interface Props {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  config: any;
  segment: any;
  segmentIndex: number;
  cabinClass: string;
  availability: any[];
  cleanPassengers: PassengerOption[];
  selectedPassengerId: string;
  selectedSeats: SelectedSeat[];
  flightData: FlightData; // 🆕 flightData is passed in as a prop
}

export const useOnIframeLoad = ({
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
}: Props): (() => void) => {
  return useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // flightData is already calculated upstream and passed in

    const availabilityData = availability || [];

    const passengerList = cleanPassengers.map((p, index) =>
      createPassengerPayload(p, index, selectedPassengerId, selectedSeats)
    );

    const message: SeatMapMessagePayload = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flightData),
      currentDeckIndex: '0'
    };

    if (availabilityData?.length > 0) {
      message.availability = JSON.stringify(availabilityData);
    }

    if (passengerList?.length > 0) {
      message.passengers = JSON.stringify(passengerList);
    }

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('📤 First postMessage sent – onLoad');
  }, [
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
  ]);
};