// file: helpers/createSelectedSeat.ts

import { SelectedSeat } from '../SeatMapComponentBase';
import { PassengerOption } from '../../../utils/parsePnrData';

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
  availability?: AvailabilityEntry[]
): SelectedSeat {
  const initials = `${passenger.givenName?.[0] || ''}${passenger.surname?.[0] || ''}`.toUpperCase();
  const abbr = passenger.surname?.slice(0, 2).toUpperCase() || '';

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
    passengerLabel: passenger.label,
    passengerColor: passenger.passengerColor || '',
    initials,
    abbr,
    readOnly,
    seat: {
      seatLabel,
      price: seatPrice,
    },
  };
}