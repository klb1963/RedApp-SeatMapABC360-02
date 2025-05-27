// file: code/components/seatMap/hooks/useSeatSelectionHandler.ts

/**
 * useSeatSelectionHandler.ts
 * 
 * 🪑 Custom React hook that handles seat selection messages from the embedded SeatMap iframe.
 * 
 * Responsibilities:
 * - Listens for postMessage events from https://quicket.io
 * - Parses and validates the incoming seat selection payload (onSeatSelected)
 * - Updates the selectedSeats state with new assignments
 * - Determines if all passengers are seated and sets boardingComplete flag
 * - Automatically advances to the next unseated passenger (auto-focus behavior)
 * 
 * This hook connects the SeatMap UI with the RedApp passenger management logic,
 * enabling interactive and sequential seat assignment.
 */

import { useEffect } from 'react';
import { PassengerOption } from '../../../utils/parsePnrData';
import { SelectedSeat } from '../SeatMapComponentBase';
import { createSelectedSeat } from '../helpers/createSelectedSeat';

interface Props {
  cleanPassengers: PassengerOption[];
  selectedPassengerId: string;
  setSelectedPassengerId: (id: string) => void;
  setSelectedSeats: React.Dispatch<React.SetStateAction<SelectedSeat[]>>;
  setBoardingComplete: (status: boolean) => void;
  onSeatChange?: (seats: SelectedSeat[]) => void;
}

export const useSeatSelectionHandler = ({
  cleanPassengers,
  selectedPassengerId,
  setSelectedPassengerId,
  setSelectedSeats,
  setBoardingComplete,
  onSeatChange
}: Props): void => {
  useEffect(() => {
    const handleSeatSelection = (event: MessageEvent) => {
      if (event.origin !== 'https://quicket.io') {
        console.warn('⚠️ Unknown message origin:', event.origin);
        return;
      }

      let parsed;
      try {
        parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        console.error('❌ Failed to parse postMessage:', e);
        return;
      }

      if (!parsed?.onSeatSelected) return;

      let seatArray = parsed.onSeatSelected;
      if (typeof seatArray === 'string') {
        try {
          seatArray = JSON.parse(seatArray);
        } catch (e) {
          console.error('❌ Failed to parse onSeatSelected:', e);
          return;
        }
      }

      if (!Array.isArray(seatArray)) return;

      const updated = seatArray
        .filter(p => p.id && p.seat?.seatLabel)
        .map(p => {
          const passenger = cleanPassengers.find(pass => String(pass.id) === String(p.id));
          if (!passenger) return null;

          return createSelectedSeat(passenger, p.seat.seatLabel, false);
        })
        .filter(Boolean) as SelectedSeat[];

      setSelectedSeats(prev => {
        const withoutOld = prev.filter(s => !updated.some(u => u.passengerId === s.passengerId));
        const merged = [...withoutOld, ...updated];
        onSeatChange?.(merged);

        const allSeated = cleanPassengers.every(p =>
          merged.some(s => s.passengerId === p.id)
        );
        setBoardingComplete(allSeated);

        const nextPassenger = cleanPassengers.find(
          p => !merged.some(s => s.passengerId === String(p.id))
        );
        if (nextPassenger) {
          setSelectedPassengerId(String(nextPassenger.id));
        }

        return merged;
      });
    };

    window.addEventListener('message', handleSeatSelection);
    return () => window.removeEventListener('message', handleSeatSelection);
  }, [cleanPassengers, selectedPassengerId, setSelectedPassengerId, setSelectedSeats, setBoardingComplete, onSeatChange]);
};