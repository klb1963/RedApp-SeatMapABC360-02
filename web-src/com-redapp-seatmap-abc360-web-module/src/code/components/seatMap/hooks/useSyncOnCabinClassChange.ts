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
import { SelectedSeat } from '../SeatMapComponentBase';

interface Props {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  config: any;
  segment: any;
  initialSegmentIndex: number;
  cabinClass: string;
  availability: any[];
  cleanPassengers: PassengerOption[];
  selectedPassengerId: string;
  selectedSeats: SelectedSeat[];
}

export const useSyncOnCabinClassChange = ({
  iframeRef,
  config,
  segment,
  initialSegmentIndex,
  cabinClass,
  availability,
  cleanPassengers,
  selectedPassengerId,
  selectedSeats
}: Props): void => {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const availabilityData = availability || [];

    const passengerList = cleanPassengers.map((p, index) =>
      createPassengerPayload(p, index, selectedPassengerId, selectedSeats)
    );

    const message: SeatMapMessagePayload = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      availability: JSON.stringify(availabilityData),
      passengers: JSON.stringify(passengerList),
      currentDeckIndex: '0'
    };

    console.log('[🚀 passengerList отправлен в iframe - смена класса]', passengerList);

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('📤 Обновление карты после смены cabinClass');
  }, [cabinClass]);
};