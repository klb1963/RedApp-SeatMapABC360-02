// file: code/components/seatMap/helpers/onDeleteSeat.ts

import { handleCancelSpecificSeat } from '../handleCancelSpecificSeat';
import { SelectedSeat } from '../SeatMapComponentBase';
import { PassengerOption } from '../../../utils/parsePnrData';

interface Params {
  seat: SelectedSeat;
  passengers: PassengerOption[];
  onSuccess: () => void;
}

export const onDeleteSeat = async ({ seat, passengers, onSuccess }: Params) => {
  const pax = passengers.find(p => String(p.id) === seat.passengerId);
  if (!pax || !pax.nameNumber || !seat.segmentNumber) {
    alert('❌ Missing name number or segment number.');
    return;
  }

  const ok = await handleCancelSpecificSeat({
    nameNumber: pax.nameNumber,
    segmentNumber: seat.segmentNumber
  });

  if (ok) {
    onSuccess(); // обновление UI: сброс места или перерисовка
  }
};