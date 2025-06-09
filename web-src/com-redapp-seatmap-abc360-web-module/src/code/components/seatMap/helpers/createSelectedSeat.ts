// file: helpers/createSelectedSeat.ts

import { SelectedSeat } from '../SeatMapComponentBase';
import { PassengerOption } from '../../../utils/parsePnrData';
import { getInitials } from './getInitials';

interface AvailabilityEntry {
  seatLabel: string;
  price?: number | string;
  currency?: string;
}

/**
 * Создаёт объект SelectedSeat из пассажира и seatLabel.
 *
 * @param passenger - объект PassengerOption
 * @param seatLabel - метка места, например "42A"
 * @param readOnly - если true, то это уже назначенное место (не редактируется)
 * @param availability - массив доступных мест с ценами
 * @returns объект SelectedSeat
 */
export function createSelectedSeat(
  passenger: PassengerOption,
  seatLabel: string,
  readOnly: boolean = false,
  availability?: AvailabilityEntry[],
  segmentNumber?: string
): SelectedSeat {
  const initials = getInitials(passenger);
  const abbr = initials;

  const passengerLabel = `${passenger.givenName}, ${passenger.surname}`;

  const matched = availability?.find(a => a.seatLabel === seatLabel);

  const seatPrice = typeof matched?.price === 'string'
  ? matched.price
  : matched?.price !== undefined && matched.currency
    ? `${matched.currency} ${matched.price.toFixed(2)}`
    : 'USD 0';

  console.log(`🎯 Seat assigned: ${seatLabel}, price from availability: ${seatPrice}`);
  console.log('🔍 Looking for seatLabel:', seatLabel);
  console.log('🔍 availabilityMapped:', availability);

  return {
    passengerId: passenger.id,
    seatLabel,
    passengerType: 'ADT',
    passengerLabel,
    passengerColor: passenger.passengerColor || '',
    initials,
    abbr,
    readOnly,
    segmentNumber: segmentNumber || '1',
    seat: {
      seatLabel,
      price: seatPrice,
    },
  };
}