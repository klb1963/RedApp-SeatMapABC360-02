// file: handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

export const handleSaveSeats = async (selectedSeats: { passengerId: string; seatLabel: string }[]): Promise<void> => {
  if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
    alert('❌ Нет выбранных мест для обновления.');
    return;
  }

  console.log('📦 Отправляем места в Sabre через UpdateReservationRQ:', selectedSeats);

  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  try {
    const seatUpdateBlocks = selectedSeats.map(seat => {
      return `
        <SeatUpdate>
          <PassengerRef>${seat.passengerId}</PassengerRef>
          <SegmentRef>1</SegmentRef>
          <Seat>${seat.seatLabel}</Seat>
        </SeatUpdate>
      `;
    }).join('');

    const xml = `
      <UpdateReservationRQ xmlns="http://services.sabre.com/sp/updatereservation/v1_6">
        <ReservationUpdate>
          ${seatUpdateBlocks}
        </ReservationUpdate>
      </UpdateReservationRQ>
    `;

    console.log('📤 XML-запрос на обновление резервации:', xml);

    const response = await soap.callSws({
      action: 'UpdateReservationRQ',
      payload: xml,
      authTokenType: 'SESSION'
    });

    console.log('✅ Ответ от Sabre:', response.value);

    if (response.value.includes('<Success')) {
      console.log('✅ Все места успешно назначены.');
    } else {
      console.warn('⚠️ Ответ не содержит <Success>. Проверьте детали.');
    }

    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Ошибка при обновлении мест:', error);
    alert('Ошибка при сохранении мест. Попробуйте снова.');
  }
};

