// file: code/components/seatMap/hooks/useSyncOnCabinClassChange.ts

/**
 * useSyncOnCabinClassChange.ts
 * 
 * 🎚️ React hook that synchronizes seat map content when the selected cabin class changes.
 * 
 * Responsibilities:
 * - Regenerates flight data and passenger visuals for the new cabin class
 * - Builds a SeatMapMessagePayload with updated data
 * - Sends the payload to the embedded SeatMap iframe via postMessage
 * 
 * Triggered automatically when the `cabinClass` prop changes.
 * Ensures that the seat map view reflects the correct cabin layout and availability.
 */

import { useEffect } from 'react';
import { PassengerOption } from '../../../utils/parsePnrData';
import { generateFlightData } from '../../../utils/generateFlightData';
import { createPassengerPayload } from '../helpers/createPassengerPayload';
import { SeatMapMessagePayload } from '../types/SeatMapMessagePayload';
import { SelectedSeat } from '../types/types';

interface Props {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  config: any;
  segment: any;
  segmentIndex: number;
  cabinClass: string;
  mappedCabinClass: 'E' | 'P' | 'B' | 'F' | 'A';
  availability: any[];
  cleanPassengers: PassengerOption[];
  selectedPassengerId: string;
  selectedSeats: SelectedSeat[];
}

export const useSyncOnCabinClassChange = ({
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
}: Props): void => {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Generate updated flight data for the selected cabin class
    const flight = generateFlightData(segment, segmentIndex, mappedCabinClass);
    const availabilityData = availability || [];

    // Prepare updated passenger payload
    const passengerList = cleanPassengers.map((p, index) =>
      createPassengerPayload(p, index, selectedPassengerId, selectedSeats)
    );

    const message: SeatMapMessagePayload = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      currentDeckIndex: '0'
    };

    if (availabilityData.length > 0) {
      message.availability = JSON.stringify(availabilityData);
    }

    if (passengerList.length > 0) {
      message.passengers = JSON.stringify(passengerList);
    }

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('📤 Seat map updated after cabin class change');
  }, [cabinClass]);
};