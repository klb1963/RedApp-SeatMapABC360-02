// file: /code/components/seatMap/handleSaveSeats.ts

// file: /code/components/seatMap/handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { SelectedSeat } from './SeatMapComponentBase';

export const handleSaveSeats = async (selectedSeats: SelectedSeat[]): Promise<void> => {
  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  const recordLocator = pnrService.getRecordLocator();
  if (!recordLocator) {
    console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
    throw new Error('No active PNR');
  }

  try {
    const { parsedData } = await loadPnrDetailsFromSabre();
    const passengers = parsedData.passengers || [];
    const segments = parsedData.segments || [];

    const segmentNumber = segments?.[0]?.segmentNumber ?? '1';

    const seatTag = `
      <Seat>
        ${selectedSeats.map(seat => {
          const pax = passengers.find(p => p.id === seat.passengerId || p.nameNumber === seat.passengerId);
          if (!pax || !pax.nameNumber || !seat.seatLabel) return '';
          return `<NameSelect NameNumber="${pax.nameNumber}"/>`;
        }).join('\n')}
        ${selectedSeats.map(seat => `<SeatSelect Number="${seat.seatLabel}"/>`).join('\n')}
        <SegmentSelect Number="${segmentNumber}"/>
      </Seat>
    `.trim();

    const xml = `
      <AirSeatRQ Version="2.1.1"
        xmlns="http://webservices.sabre.com/sabreXML/2011/10"
        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Seats>
          ${seatTag}
        </Seats>
      </AirSeatRQ>
    `.trim();

    console.log('📤 Sending AirSeatRQ:\n', xml);

    const response = await soap.callSws({
      action: 'AirSeatLLSRQ',
      payload: xml,
      authTokenType: 'SESSION',
    });

    console.log('📩 Response from Sabre:\n', response.value);

    if (response.value.includes('<Error')) {
      console.warn('⚠️ Ошибка в ответе от Sabre:\n', response.value);
      alert('❌ Ошибка при назначении мест. См. консоль.');
      return;
    }

    console.log('✅ Seats assigned successfully.');
    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Ошибка при отправке AirSeatRQ:', error);
    alert('❌ Ошибка при назначении мест (AirSeatRQ).');
  }
};