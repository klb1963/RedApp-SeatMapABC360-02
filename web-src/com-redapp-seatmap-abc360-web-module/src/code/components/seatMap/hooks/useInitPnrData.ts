// file: code/components/seatMap/hooks/useInitPnrData.ts

import { useEffect } from 'react';
import { loadPnrDetailsFromSabre } from '../../../services/loadPnrDetailsFromSabre';
import { PassengerOption } from '../../../utils/parsePnrData';
import { SelectedSeat } from '../SeatMapComponentBase';
import { createSelectedSeat } from '../helpers/createSelectedSeat';

interface UseInitPnrDataProps {
  setPassengers: (p: PassengerOption[]) => void;
  setFlightSegments: (segments: any[]) => void;
  setSelectedSegmentIndex: (index: number) => void;
  setSelectedSeats: (seats: SelectedSeat[]) => void;
  setSelectedPassengerIds: (ids: string[]) => void;
}

export const useInitPnrData = ({
  setPassengers,
  setFlightSegments,
  setSelectedSegmentIndex,
  setSelectedSeats,
  setSelectedPassengerIds
}: UseInitPnrDataProps): void => {
  useEffect(() => {
    const initPnrData = async () => {
      try {
        const { parsedData } = await loadPnrDetailsFromSabre();

        console.log('✅ parsedData.passengers:', parsedData.passengers);
        console.log('🧩 Segments from parsed PNR Data [RAW]:', parsedData.segments);

        const passengers = parsedData.passengers || [];
        const segments = parsedData.segments || [];

        setPassengers(passengers);
        setFlightSegments(segments);
        setSelectedSegmentIndex(0);


        const freshSeats = passengers.map((p) =>
          createSelectedSeat(p, '', false)
        );
        setSelectedSeats(freshSeats);

        const passengerIds = passengers.map((p) => String(p.id));
        setSelectedPassengerIds(passengerIds);
      } catch (error) {
        console.error('❌ Ошибка при инициализации данных PNR:', error);
      }
    };

    initPnrData();
  }, [
    setPassengers,
    setFlightSegments,
    setSelectedSegmentIndex,
    setSelectedSeats,
    setSelectedPassengerIds
  ]);
};