// file: /code/components/seatMap/handleResetSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { SelectedSeat } from './SeatMapComponentBase';

export const handleResetSeats = async (): Promise<void> => {
  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  const recordLocator = pnrService.getRecordLocator();
  if (!recordLocator) {
    console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
    throw new Error('No active PNR');
  }

  try {
    const confirmed = window.confirm('❓ Are you sure you want to reset all seat assignments?');
    if (!confirmed) return;

    const { parsedData } = await loadPnrDetailsFromSabre();
    const passengers = parsedData.passengers || [];
    const segments = parsedData.segments || [];
    const segmentNumber = segments?.[0]?.segmentNumber ?? '1';

    const seatRemovalTags = passengers.map(pax => {
      if (!pax.nameNumber) return '';
      return `
        <Seat>
          <NameSelect NameNumber="${pax.nameNumber}" />
          <SeatSelect />
          <SegmentSelect Number="${segmentNumber}" />
        </Seat>
      `;
    }).join('\n');

    const xml = `
      <AirSeatRQ Version="2.1.1"
        xmlns="http://webservices.sabre.com/sabreXML/2011/10"
        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Seats>
          ${seatRemovalTags}
        </Seats>
      </AirSeatRQ>
    `.trim();

    console.log('📤 Sending AirSeatRQ to remove all seats:\n', xml);

    const response = await soap.callSws({
      action: 'AirSeatLLSRQ',
      payload: xml,
      authTokenType: 'SESSION',
    });

    console.log('📩 Response from Sabre (reset):\n', response.value);

    if (response.value.includes('<Error')) {
      console.warn('⚠️ Ошибка при удалении мест из PNR:\n', response.value);
      alert('❌ Ошибка при сбросе мест. См. консоль.');
      return;
    }

    console.log('✅ Seats reset successfully.');
    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Ошибка при отправке запроса на сброс мест:', error);
    alert('❌ Ошибка при сбросе мест (AirSeatRQ).');
  }
};