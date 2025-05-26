// file: helpers/createSelectedSeat.ts

import { SelectedSeat } from '../SeatMapComponentBase';
import { PassengerOption } from '../../../utils/parcePnrData';

/**
 * Создаёт объект SelectedSeat из пассажира и seatLabel.
 *
 * @param passenger - объект PassengerOption
 * @param seatLabel - метка места, например "42A"
 * @param readOnly - если true, то это уже назначенное место (не редактируется)
 * @returns объект SelectedSeat
 */
export function createSelectedSeat(
    passenger: PassengerOption,
    seatLabel: string,
    readOnly: boolean = false
  ): SelectedSeat {
    const initials = `${passenger.givenName?.[0] || ''}${passenger.surname?.[0] || ''}`.toUpperCase();
    const abbr = passenger.surname?.slice(0, 2).toUpperCase() || '';
  
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
        price: 'USD 0',
      },
    };
  }