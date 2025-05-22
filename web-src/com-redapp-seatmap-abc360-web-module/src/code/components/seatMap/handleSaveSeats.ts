// file: /code/components/seatMap/handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { SelectedSeat } from '../seatMap/SeatMapComponentBase';

export const handleSaveSeats = async (selectedSeats: SelectedSeat[]): Promise<void> => {
  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  try {
    const { parsedData } = await loadPnrDetailsFromSabre();
    const passengers = parsedData.passengers || [];
    const segments = parsedData.segments || [];

    const segmentNumber = segments[0]?.value || '1';

    console.log('🧪 selectedSeats:', selectedSeats);
    console.log('🧪 parsedData.passengers:', passengers.map(p => ({
      id: p.id,
      nameNumber: p.nameNumber
    })));

    const seatTags = passengers.map(pax => {
      const match = selectedSeats.find(
        s => s.passengerId === pax.id || s.passengerId === pax.nameNumber
      );
      if (!match) return '';
      return `<Seat NameNumber="${pax.nameNumber}" Number="${match.seatLabel}" SegmentNumber="${segmentNumber}" />`;
    }).filter(Boolean).join('\n');

    if (!seatTags.trim()) {
      console.warn('⚠️ Нет подходящих мест для обновления PNR.');
      alert('Невозможно сохранить — не выбрано ни одного места.');
      return;
    }

    const xml = `
      <UpdatePassengerNameRecordRQ Version="2.0.0"
        xmlns="http://webservices.sabre.com/sabreXML/2011/10"
        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <SpecialReqDetails>
          <AirSeatRQ>
            <Seats>
              ${seatTags}
            </Seats>
          </AirSeatRQ>
        </SpecialReqDetails>
        <PostProcessing RedisplayReservation="true" />
        <ReceivedFrom>LEONID</ReceivedFrom>
      </UpdatePassengerNameRecordRQ>
    `.trim();

    console.log('📌 FINAL payload for Sabre:\n', xml);
    console.log('🧪 SegmentNumber from parsedData:', segments[0]);
    console.log('🧪 All selectedSeats:', selectedSeats);
    console.log('🧪 All passengers:', passengers);

    console.log('📤 UpdatePassengerNameRecordRQ XML:\n', xml);

    const response = await soap.callSws({
      action: 'UpdatePassengerNameRecordRQ',
      payload: xml,
      authTokenType: 'SESSION'
    });

    console.log('📩 Ответ от Sabre:\n', response.value);

    // 💬 Показываем и XML, и ответ для отладки
    alert(`📤 Sent XML:\n${xml}\n\n📩 Sabre Response:\n${response.value}`);

    if (response.value.includes('<Success')) {
      console.log('✅ Успешное обновление мест через UpdatePassengerNameRecordRQ.');
      await pnrService.refreshData();
      modalService.closeReactModal();
    } else {
      console.warn('⚠️ Ответ не содержит <Success>. Проверь данные.');
      alert('Ответ от Sabre не содержит <Success>. Сохранение не выполнено.');
    }

  } catch (error) {
    console.error('❌ Ошибка при сохранении мест:', error);
    alert('Ошибка при сохранении мест. См. консоль.');
  }
};