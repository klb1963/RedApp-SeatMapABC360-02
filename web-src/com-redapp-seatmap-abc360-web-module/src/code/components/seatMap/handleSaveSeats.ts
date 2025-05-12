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
    // 📍 Сбор всех блоков <SeatUpdate>
    const seatUpdateBlocks = selectedSeats.map(seat => {
      return `
        <SeatUpdate>
          <PassengerRef>${seat.passengerId}</PassengerRef>
          <SegmentRef>1</SegmentRef>
          <Seat>${seat.seatLabel}</Seat>
        </SeatUpdate>`;
    }).join('');

    // 📄 Общий XML
    const xml = `
      <UpdateReservationRQ xmlns="http://services.sabre.com/sp/updatereservation/v1_6">
        <Profile>
          <UniqueID ID="" />
        </Profile>
        <ReservationUpdate>
          ${seatUpdateBlocks}
        </ReservationUpdate>
      </UpdateReservationRQ>
    `;

    const response = await soap.callSws({
      action: 'UpdateReservationRQ',
      payload: xml,
      authTokenType: 'SESSION'
    });

    console.log('✅ Все места успешно назначены:', response.value);

    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Ошибка при обновлении мест:', error);
    alert('Ошибка при обновлении мест. Попробуйте снова.');
  }
};