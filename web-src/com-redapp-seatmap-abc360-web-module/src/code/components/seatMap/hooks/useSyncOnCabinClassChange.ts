// file: useSyncOnCabinClassChange.ts

import { useEffect } from 'react';
import { PassengerOption } from '../../../utils/parcePnrData';
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