// file: code/components/seatMap/handleReassignSeats.ts

import { SelectedSeat } from './SeatMapComponentBase';

interface ReassignSeatParams {
  passengerId: string;
  selectedSeats: SelectedSeat[];
  setSelectedSeats: (seats: SelectedSeat[]) => void;
  setSelectedPassengerId: (id: string) => void;
}

export function handleReassignSeat({
  passengerId,
  selectedSeats,
  setSelectedSeats,
  setSelectedPassengerId,
}: ReassignSeatParams) {
  const updatedSeats = selectedSeats.filter(s => s.passengerId !== passengerId);

  setSelectedSeats(updatedSeats);
  setSelectedPassengerId(passengerId); // Вернуть в фокус, чтобы можно было пересадить
}