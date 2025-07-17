// file: /code/components/seatMap/internal/useFallbackSeatMapAvailability.ts

import { useState, useMemo } from 'react';
import { PassengerOption, SelectedSeat, CabinClass } from '../types/types';

interface Segment {
  segmentNumber: string;
  bookingClass?: string;
  [key: string]: any;
}

interface Params {
  passengers: PassengerOption[];
  segments: Segment[];
  initialAssignedSeats?: SelectedSeat[];
  initialSegmentIndex?: number;
  initialCabinClass?: CabinClass;
}

export function useFallbackSeatMapAvailability({
  passengers,
  segments,
  initialAssignedSeats = [],
  initialSegmentIndex = 0,
  initialCabinClass = 'Y',
}: Params) {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>(initialAssignedSeats);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number>(initialSegmentIndex);
  const [cabinClass, setCabinClass] = useState<CabinClass>(initialCabinClass);

  const [selectedPassengerId, setSelectedPassengerId] = useState<string>(
    passengers[0]?.id || ''
  );

  const currentSegment = segments[selectedSegmentIndex];
  const currentSegmentNumber = currentSegment?.segmentNumber;

  const selectedSeatsForCurrent = useMemo(() => {
    return selectedSeats.filter(s => s.segmentNumber === currentSegmentNumber);
  }, [selectedSeats, currentSegmentNumber]);

  const handleSeatSelect = (seatLabel: string, passengerId: string) => {
    const pax = passengers.find(p => p.id === passengerId);
    if (!pax || !currentSegmentNumber) return;

    const updated = selectedSeats.filter(
      s => !(s.passengerId === passengerId && s.segmentNumber === currentSegmentNumber)
    );

    const seat: SelectedSeat = {
      passengerId,
      seatLabel,
      segmentNumber: currentSegmentNumber,
      passengerType: '', // если нужно
      passengerLabel: pax.label || '',
      passengerColor: pax.passengerColor || '',
      initials: `${pax.givenName[0]}${pax.surname[0]}`,
      passengerInitials: `${pax.givenName[0]}${pax.surname[0]}`,
      seat: { seatLabel, price: '0' },
    };

    setSelectedSeats([...updated, seat]);

    // автоматический переход к следующему пассажиру без места
    const assignedPassengerIdsForCurrent = [...updated, seat]
      .filter(s => s.segmentNumber === currentSegmentNumber)
      .map(s => s.passengerId);

    const nextPax = passengers.find(
      p => !assignedPassengerIdsForCurrent.includes(p.id)
    );

    if (nextPax) {
      setSelectedPassengerId(nextPax.id);
    }
  };

  const resetCurrentSegmentSeats = () => {
    if (!currentSegmentNumber) return;
    setSelectedSeats(prev => prev.filter(s => s.segmentNumber !== currentSegmentNumber));
  };

  return {
    selectedSeats,
    selectedSeatsForCurrent,
    setSelectedSeats,
    selectedPassengerId,
    setSelectedPassengerId,
    selectedSegmentIndex,
    setSelectedSegmentIndex,
    cabinClass,
    setCabinClass,
    passengers,
    segments,
    currentSegment,
    currentSegmentNumber,
    handleSeatSelect,
    resetCurrentSegmentSeats,
  };
}