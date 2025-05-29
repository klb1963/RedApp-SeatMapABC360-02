// file: /code/components/seatMap/handleDeleteSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

export const handleDeleteSeats = async (): Promise<void> => {
  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  const recordLocator = pnrService.getRecordLocator();
  if (!recordLocator) {
    console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
    throw new Error('No active PNR');
  }

  const confirmed = window.confirm('❓ Are you sure you want to delete all seat assignments?');
  if (!confirmed) return;

  const xml = `
    <AirSeatCancelRQ Version="2.1.0" xmlns="http://webservices.sabre.com/sabreXML/2011/10">
      <Seats>
        <Seat All="true"/>
      </Seats>
    </AirSeatCancelRQ>
  `.trim();

  try {
    console.log('📤 Sending AirSeatCancelRQ to cancel all seats:\n', xml);

    const response = await soap.callSws({
      action: 'AirSeatCancelLLSRQ',
      payload: xml,
      authTokenType: 'SESSION',
    });

    console.log('📩 Response from Sabre:\n', response.value);

    if (response.value.includes('<Error')) {
      console.warn('⚠️ Ошибка при отмене мест:\n', response.value);
      alert('❌ Ошибка при отмене мест. См. консоль.');
      return;
    }

    console.log('✅ Seats canceled in PNR.');
    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Ошибка при отмене мест:', error);
    alert('❌ Ошибка при отмене мест. Подробнее в консоли.');
  }
};