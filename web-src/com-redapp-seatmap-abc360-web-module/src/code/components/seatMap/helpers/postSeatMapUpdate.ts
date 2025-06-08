// file: code/components/seatMap/helpers/postSeatMapUpdate.ts

import { PassengerOption } from '../../../utils/parsePnrData';
import { SeatMapMessagePayload } from '../types/SeatMapMessagePayload';
import { SelectedSeat } from '../SeatMapComponentBase';
import { createPassengerPayload } from './createPassengerPayload';
import { FlightData } from '../../../utils/generateFlightData';

interface PostSeatMapUpdateParams {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  config: any;
  flight: FlightData;
  availability: any[];
  passengers: PassengerOption[];
  passengerPayload?: any[];
  selectedPassengerId: string;
  selectedSeats: SelectedSeat[];
}

export function postSeatMapUpdate({
  iframeRef,
  config,
  flight,
  availability,
  passengers,
  selectedPassengerId,
  selectedSeats
}: PostSeatMapUpdateParams) {
  const passengerList = passengers.map((p, index) =>
    createPassengerPayload(p, index, selectedPassengerId, selectedSeats)
  );

  const message: SeatMapMessagePayload = {
    type: 'seatMaps',
    config: JSON.stringify(config),
    flight: JSON.stringify(flight),
    availability: JSON.stringify(availability),
    passengers: JSON.stringify(passengerList),
    currentDeckIndex: '0'
  };

  iframeRef.current?.contentWindow?.postMessage(message, 'https://quicket.io');
} 
