// file: handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

/**
 * Использует PassengerDetailsRQ для назначения мест пассажирам.
 * Передаём nameNumber в формате NameNumber (например, "2.1").
 */
export const handleSaveSeats = async (
  selectedSeats: { nameNumber: string; seatLabel: string }[] // ✅ заменили nameAssocId на nameNumber
): Promise<void> => {
  if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
    alert('❌ Нет выбранных мест для обновления.');
    return;
  }

  console.log('📦 Отправляем места через PassengerDetailsRQ:', selectedSeats);

  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  try {
    const seatRequests = selectedSeats.map(seat => {
      const nameNumber = seat.nameNumber; // ✅ nameNumber уже в нужном формате: "2.1"
      return `
        <Service SSR_Code="SEAT" SSR_Type="A" SegmentNumber="A">
          <PersonName NameNumber="${nameNumber}" />
          <Text>${seat.seatLabel}</Text>
        </Service>
      `.trim();
    }).join('\n');

    const xml = `
      <PassengerDetailsRQ xmlns="http://services.sabre.com/sp/pd/v3_5" version="3.5.0" ignoreOnError="false" haltOnError="false">
        <PostProcessing ignoreAfter="false" unmaskCreditCard="true">
          <RedisplayReservation waitInterval="1000"/>
        </PostProcessing>
        <SpecialReqDetails>
          <SpecialServiceRQ>
            <SpecialServiceInfo>
              ${seatRequests}
            </SpecialServiceInfo>
          </SpecialServiceRQ>
        </SpecialReqDetails>
      </PassengerDetailsRQ>
    `.trim();

    console.log('📤 PassengerDetailsRQ XML:\n', xml);

    const response = await soap.callSws({
      action: 'PassengerDetailsRQ',
      payload: xml,
      authTokenType: 'SESSION'
    });

    console.log('📩 Ответ от Sabre:\n', response.value);

    if (response.value.includes('<Success')) {
      console.log('✅ Места успешно сохранены.');
    } else {
      console.warn('⚠️ Ответ не содержит <Success>. Проверьте XML и PNR.');
    }

    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Ошибка при отправке PassengerDetailsRQ:', error);
    alert('Ошибка при сохранении мест. Проверьте консоль.');
  }
};