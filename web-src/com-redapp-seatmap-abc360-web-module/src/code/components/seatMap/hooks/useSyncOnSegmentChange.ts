// file: code/components/seatMap/hooks/useSyncOnSegmentChange.ts

/**
 * useSyncOnSegmentChange.ts
 * 
 * 🔁 React hook that synchronizes the seat map content when the selected flight segment changes.
 * 
 * Responsibilities:
 * - Regenerates flight data and passenger payload for the new segment
 * - Builds a SeatMapMessagePayload including updated config, flight, availability, and passengers
 * - Sends the payload to the SeatMap iframe via postMessage
 * 
 * Triggered automatically when `initialSegmentIndex` changes.
 * Keeps the seat map view aligned with the currently selected segment.
 */

import { useEffect } from 'react';
import { PassengerOption } from '../../../utils/parsePnrData';
import { FlightData } from '../../../utils/generateFlightData';
import { createPassengerPayload } from '../helpers/createPassengerPayload';
import { SeatMapMessagePayload } from '../types/SeatMapMessagePayload';
import { SelectedSeat } from '../SeatMapComponentBase';
import { mapCabinToCode } from '../../../utils/mapCabinToCode';

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
  generateFlightData: (segment: any, index: number, cabin: string) => FlightData;
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
  generateFlightData
}: Props) => {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const mappedCabin = mappedCabinClass;
    const flight = generateFlightData(segment, segmentIndex, mappedCabin);
    const availabilityData = availability || [];

    const passengerList = passengers.map((p, index) =>
      createPassengerPayload(p, index, selectedPassengerId, selectedSeats)
    );

    const message: SeatMapMessagePayload = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      currentDeckIndex: '0'
    };
    
    if (availabilityData?.length > 0) {
      message.availability = JSON.stringify(availabilityData);
    }
    
    if (passengerList?.length > 0) {
      message.passengers = JSON.stringify(passengerList);
    }

    console.log('[🚀 passengerList отправлен в iframe - смена сегмента]', passengerList);

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('📤 Обновление карты после смены сегмента');
  }, [segmentIndex]);
};