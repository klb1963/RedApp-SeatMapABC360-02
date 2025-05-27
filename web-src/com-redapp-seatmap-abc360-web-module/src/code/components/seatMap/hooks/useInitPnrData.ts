// file: code/components/seatMap/hooks/useInitPnrData.ts

import { useEffect } from 'react';
import { loadPnrDetailsFromSabre } from '../../../services/loadPnrDetailsFromSabre';
import { PassengerOption } from '../../../utils/parsePnrData';
import { SelectedSeat } from '../SeatMapComponentBase';
import { createSelectedSeat } from '../helpers/createSelectedSeat';
import { enrichPassengerData } from '../utils/enrichPassengerData';

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

        const segments = parsedData.segments || [];

        // ✅ Enrich passenger data: add colors and extract assigned seats
        const { enrichedPassengers, assignedSeats } = enrichPassengerData(parsedData.passengers || []);

        setPassengers(enrichedPassengers);
        setFlightSegments(segments);
        setSelectedSegmentIndex(0);

        // ✅ Use real assigned seats if available, otherwise assign blank seats
        const freshSeats = assignedSeats.length
          ? assignedSeats.map(({ passengerId, seat }) => {
            const p = enrichedPassengers.find(p => p.id === passengerId);
            return createSelectedSeat(p, seat, false);
          })
          : enrichedPassengers.map((p) => createSelectedSeat(p, '', false));

        setSelectedSeats(freshSeats);

        const passengerIds = enrichedPassengers.map((p) => String(p.id));
        setSelectedPassengerIds(passengerIds);

      } catch (error) {
        console.error('❌ Ошибка при инициализации данных PNR:', error);
      }
    };

    console.log('✅ useInitPnrData complete');

    initPnrData();
  }, [
    setPassengers,
    setFlightSegments,
    setSelectedSegmentIndex,
    setSelectedSeats,
    setSelectedPassengerIds
  ]);
};