// file: handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

export const handleSaveSeats = async (selectedSeats: any[]): Promise<void> => {
  if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
    alert('❌ Нет выбранных мест для обновления.');
    return;
  }

  console.log('📦 Отправляем места в Sabre:', selectedSeats);

  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  try {
    for (const seat of selectedSeats) {
      const xml = `
        <UpdateReservationRQ xmlns="http://services.sabre.com/sp/updatereservation/v1_6">
          <Profile>
            <UniqueID ID="" />
          </Profile>
          <ReservationUpdate>
            <SeatUpdate>
              <PassengerRef>${seat.passengerId}</PassengerRef>
              <SegmentRef>1</SegmentRef>
              <Seat>${seat.seatLabel}</Seat>
            </SeatUpdate>
          </ReservationUpdate>
        </UpdateReservationRQ>
      `;

      const response = await soap.callSws({
        action: 'UpdateReservationRQ',
        payload: xml,
        authTokenType: 'SESSION'
      });

      console.log(`✅ Назначено место ${seat.seatLabel} → пассажиру ${seat.passengerId}`, response.value);
    }

    // ✅ Обновление PNR и закрытие окна
    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Ошибка при обновлении мест:', error);
    alert('Ошибка при обновлении мест. Попробуйте снова.');
  }
};