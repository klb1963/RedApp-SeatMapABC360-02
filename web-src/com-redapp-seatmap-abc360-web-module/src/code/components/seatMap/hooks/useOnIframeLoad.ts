// file: useOnIframeLoad.ts

import { useCallback } from 'react';
import { PassengerOption } from '../../../utils/parcePnrData';
import { FlightData } from '../../../utils/generateFlightData';
import { SeatMapMessagePayload } from '../types/SeatMapMessagePayload';
import { createPassengerPayload } from '../helpers/createPassengerPayload';

interface Props {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  config: any;
  segment: any;
  initialSegmentIndex: number;
  cabinClass: string;
  availability: any[];
  cleanPassengers: PassengerOption[];
  selectedPassengerId: string;
  selectedSeats: { passengerId: string; seatLabel: string }[];
  generateFlightData: (segment: any, index: number, cabin: string) => FlightData;
}

export const useOnIframeLoad = ({
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
}: Props): (() => void) => {
  return useCallback(() => {
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

    console.log('[🚀 passengerList send to iframe - onLoad]', passengerList);
    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);

    console.log('📤 First postMessage send - onLoad');
  }, [
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
  ]);
};