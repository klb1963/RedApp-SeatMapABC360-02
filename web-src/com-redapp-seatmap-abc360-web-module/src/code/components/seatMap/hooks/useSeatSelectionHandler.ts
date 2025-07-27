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
 * - Automatically advances to the next unseated passenger (auto-focus behavior)
 * 
 * This hook connects the SeatMap UI with the RedApp passenger management logic,
 * enabling interactive and sequential seat assignment.
 */

import { useEffect } from 'react';
import { PassengerOption } from '../../../utils/parsePnrData';
import { SelectedSeat } from '../types/types';
import { createSelectedSeat } from '../helpers/createSelectedSeat';

interface RawAvailabilityItem {
  label: string;
  price?: number;
  currency?: string;
}

interface ProcessedAvailabilityItem {
  seatLabel: string;
  price?: string;
}

interface Props {
  cleanPassengers: PassengerOption[];
  selectedPassengerId: string;
  setSelectedPassengerId: (id: string) => void;
  setSelectedSeats: React.Dispatch<React.SetStateAction<SelectedSeat[]>>;
  onSeatChange?: (seats: SelectedSeat[]) => void;
  availability?: RawAvailabilityItem[];
  segmentNumber: string;
}

export const useSeatSelectionHandler = ({
  cleanPassengers,
  selectedPassengerId,
  setSelectedPassengerId,
  setSelectedSeats,
  onSeatChange,
  availability,
  segmentNumber
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

      const availabilityMapped: ProcessedAvailabilityItem[] | undefined = availability?.map((a) => ({
        seatLabel: a.label,
        price: a.currency && a.price !== undefined ? `${a.currency} ${a.price.toFixed(2)}` : undefined
      }));

      const selectedSeatData = seatArray.find(p => String(p.id) === selectedPassengerId && p.seat?.seatLabel);
      if (!selectedSeatData) return;

      const currentPassenger = cleanPassengers.find(p => String(p.id) === selectedPassengerId);
      if (!currentPassenger) return;

      
      console.log('✅ assigning seat with segmentNumber:', segmentNumber);

      const updatedSeat = createSelectedSeat(
        currentPassenger,
        selectedSeatData.seat.seatLabel,
        false,
        availabilityMapped,
        segmentNumber
      );
      
      console.log('✅ updatedSeat:', updatedSeat);

      setSelectedSeats(prev => {
        const withoutOld = prev.filter(s => s.passengerId !== currentPassenger.id);
        const merged = [...withoutOld, updatedSeat];

        onSeatChange?.(merged);

        // ⏭️ Only auto-advance if radio not manually selected (i.e. keep current if selected manually)
        const nextUnseated = cleanPassengers.find(p => !merged.some(s => s.passengerId === p.id));
        if (nextUnseated && selectedSeatData.id === selectedPassengerId) {
          setSelectedPassengerId(String(nextUnseated.id));
        }

        return merged;
      });
    };

    window.addEventListener('message', handleSeatSelection);
    return () => window.removeEventListener('message', handleSeatSelection);
  }, [cleanPassengers, selectedPassengerId, setSelectedPassengerId, setSelectedSeats, onSeatChange, availability]);
};
