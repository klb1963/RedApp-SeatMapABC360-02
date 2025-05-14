// file: code/components/seatMap/hooks/useSyncOnSegmentChange.ts

import { useEffect } from 'react';
import { PassengerOption } from '../../../utils/parcePnrData';
import { FlightData } from '../../../utils/generateFlightData';
import { createPassengerPayload } from '../helpers/createPassengerPayload';
import { SeatMapMessagePayload } from '../types/SeatMapMessagePayload';
import { FlightSegment } from 'sabre-ngv-app/app/common/data/flight/FlightSegment';

interface Props {
  config: any;
  segment: any;
  initialSegmentIndex: number;
  cabinClass: string;
  availability: any[];
  passengers: PassengerOption[];
  selectedPassengerId: string;
  selectedSeats: { passengerId: string; seatLabel: string }[];
  iframeRef: React.RefObject<HTMLIFrameElement>;
  generateFlightData: (segment: any, index: number, cabin: string) => FlightData;
}

export const useSyncOnSegmentChange = ({
  config,
  segment,
  initialSegmentIndex,
  cabinClass,
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

    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const availabilityData = availability || [];

    const passengerList = passengers.map((p, index) =>
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

    console.log('[🚀 passengerList отправлен в iframe - смена сегмента]', passengerList);

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('📤 Обновление карты после смены сегмента');
  }, [initialSegmentIndex]);
};