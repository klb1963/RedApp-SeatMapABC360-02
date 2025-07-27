
// file: code/components/seatMap/helpers/postSeatMapUpdate.ts

import { PassengerOption } from '../../../utils/parsePnrData';
import { SeatMapMessagePayload } from '../types/SeatMapMessagePayload';
import { SelectedSeat } from '../types/types';
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

/**
 * Sends an updated seat map state to the embedded Quicket iframe.
 *
 * 1. Builds a list of passengers with seat assignment info using `createPassengerPayload`.
 * 2. Constructs a `SeatMapMessagePayload` with configuration, flight, availability, and passenger data.
 * 3. Sends the payload to the iframe via `postMessage` targeting https://quicket.io.
 *
 * This is used to keep the iframe in sync with the React application's internal state.
 *
 * @param iframeRef - reference to the iframe element
 * @param config - general seat map configuration
 * @param flight - flight data used to render the seat map
 * @param availability - array of available seats
 * @param passengers - full list of passengers
 * @param selectedPassengerId - ID of the currently selected passenger
 * @param selectedSeats - all currently selected seats
 */
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

  console.log('✈️ Sending seat map update to iframe:', {
    flight,
    startRow: flight.startRow,
    endRow: flight.endRow
  });

  iframeRef.current?.contentWindow?.postMessage(message, 'https://quicket.io');
}