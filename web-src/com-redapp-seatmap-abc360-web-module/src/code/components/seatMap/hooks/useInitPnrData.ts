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
  segmentIndex: number;
}

export const useInitPnrData = ({
  setPassengers,
  setFlightSegments,
  setSelectedSegmentIndex,
  setSelectedSeats,
  setSelectedPassengerIds,
  segmentIndex,
}: UseInitPnrDataProps): void => {
  useEffect(() => {
    const initPnrData = async () => {
      try {
        const { parsedData } = await loadPnrDetailsFromSabre();

        console.log('✅ parsedData.passengers:', parsedData.passengers);
        console.log('🧩 Segments from parsed PNR Data [RAW]:', parsedData.segments);

        const segments = parsedData.segments || [];
        const currentSegment = segments[segmentIndex]; // ✅ выбрали сегмент по индексу

        if (!currentSegment) {
          console.error(`❌ Segment at index ${segmentIndex} not found`);
          return;
        }

        setFlightSegments(segments);
        setSelectedSegmentIndex(segmentIndex);

        const enrichedPassengers = enrichPassengerData(parsedData.passengers || []);
        const assignedSeats = parsedData.assignedSeats || [];

        setPassengers(enrichedPassengers);

        const freshSeats = assignedSeats.length
          ? assignedSeats
              .filter(s => s.segmentNumber === currentSegment.value) // 🪑 только для выбранного сегмента
              .map(({ passengerId, seat }) => {
                const p = enrichedPassengers.find(p => p.id === passengerId);
                return createSelectedSeat(p, seat, false, undefined, currentSegment?.value);
              })
          : enrichedPassengers.map((p) =>
              createSelectedSeat(p, '', false, undefined, currentSegment?.value)
            );

        setSelectedSeats(freshSeats);

        const passengerIds = enrichedPassengers.map((p) => String(p.id));
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
    setSelectedPassengerIds,
    segmentIndex, // 👈 подписались на смену сегмента
  ]);
};