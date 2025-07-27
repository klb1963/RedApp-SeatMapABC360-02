/**
 * useInitPnrData.ts
 *
 * Custom React hook to initialize PNR data on component mount.
 * Loads PNR from Sabre, enriches passenger data, sets segment and seat states.
 *
 * Responsibilities:
 * - Fetch parsed PNR data from Sabre
 * - Select and apply current flight segment based on segmentIndex
 * - Enrich passengers with additional metadata (e.g., initials)
 * - Map assigned seats for the current segment
 * - Initialize selected seats and selected passenger IDs
 */

import { useEffect } from 'react';
import { loadPnrDetailsFromSabre } from '../../../services/loadPnrDetailsFromSabre';
import { PassengerOption } from '../../../utils/parsePnrData';
import { SelectedSeat } from '../types/types';
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
        const currentSegment = segments[segmentIndex]; // ✅ pick current segment by index

        if (!currentSegment) {
          console.error(`❌ Segment at index ${segmentIndex} not found`);
          return;
        }

        setFlightSegments(segments);
        setSelectedSegmentIndex(segmentIndex);

        const enrichedPassengers = enrichPassengerData(parsedData.passengers || []);
        const assignedSeats = parsedData.assignedSeats || [];

        setPassengers(enrichedPassengers);

        // If there are assigned seats for current segment — use them, else generate empty ones
        const freshSeats = assignedSeats.length
          ? assignedSeats
              .filter(s => s.segmentNumber === currentSegment.value) // 🪑 filter by segment
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
        console.error('❌ Failed to initialize PNR data:', error);
      }
    };

    initPnrData();
  }, [
    setPassengers,
    setFlightSegments,
    setSelectedSegmentIndex,
    setSelectedSeats,
    setSelectedPassengerIds,
    segmentIndex, // 👈 re-run on segment change
  ]);
};