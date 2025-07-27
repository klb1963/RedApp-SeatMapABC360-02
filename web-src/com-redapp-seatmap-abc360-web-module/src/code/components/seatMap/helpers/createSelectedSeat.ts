// file: helpers/createSelectedSeat.ts

import { SelectedSeat } from '../types/types';
import { PassengerOption } from '../../../utils/parsePnrData';
import { getInitials } from './getInitials';

interface AvailabilityEntry {
  seatLabel: string;
  price?: number | string;
  currency?: string;
}

/**
 * Creates a SelectedSeat object from passenger and seat label.
 *
 * @param passenger - PassengerOption object
 * @param seatLabel - seat label, e.g. "42A"
 * @param readOnly - if true, this is a pre-assigned (non-editable) seat
 * @param availability - optional array of available seats with pricing
 * @param segmentNumber - flight segment number (required)
 * @returns SelectedSeat object
 */
export function createSelectedSeat(
  passenger: PassengerOption,
  seatLabel: string,
  readOnly: boolean,
  availability: AvailabilityEntry[] | undefined,
  segmentNumber: string
): SelectedSeat {
  const initials = getInitials(passenger);
  const abbr = initials;

  const passengerLabel = `${passenger.givenName}, ${passenger.surname}`;

  const matched = availability?.find(a => a.seatLabel === seatLabel);

  const seatPrice =
    typeof matched?.price === 'string'
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
    passengerInitials: initials,
    abbr,
    readOnly,
    segmentNumber,
    seat: {
      seatLabel,
      price: seatPrice,
    },
  };
}