// file: /code/components/seatMap/handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

/**
 * ВРЕМЕННАЯ ВЕРСИЯ: тестируем AirSeatRQ с жёстко заданным NameNumber и местом.
 */
export const handleSaveSeats = async (): Promise<void> => {
  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  try {
    const xml = `
      <AirSeatRQ Version="2.1.1"
        xmlns="http://webservices.sabre.com/sabreXML/2011/10"
        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Seats>
          <Seat>
            <NameSelect NameNumber="1.1"/>
            <SeatSelect Number="10A"/>
            <SegmentSelect Number="1"/>
          </Seat>
        </Seats>
      </AirSeatRQ>
    `.trim();

    console.log('📤 AirSeatRQ HARDCODED XML:\n', xml);

    const response = await soap.callSws({
      action: 'AirSeatRQ',
      payload: xml,
      authTokenType: 'SESSION'
    });

    console.log('📩 Ответ от Sabre:\n', response.value);

    if (response.value.includes('<Success')) {
      console.log('✅ Успешное назначение места через AirSeatRQ (hardcoded).');
    } else {
      console.warn('⚠️ Ответ не содержит <Success>. Проверь данные.');
    }

    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Ошибка при отправке AirSeatRQ (hardcoded):', error);
    alert('Ошибка при назначении места. См. консоль.');
  }
};