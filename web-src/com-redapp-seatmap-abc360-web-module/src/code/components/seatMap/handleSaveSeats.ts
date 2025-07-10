// file: /code/components/seatMap/handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { SelectedSeat } from './SeatMapComponentBase';

export const handleSaveSeats = async (
    selectedSeats: SelectedSeat[],
    segmentNumber: string
): Promise<void> => {
  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  const recordLocator = pnrService.getRecordLocator();
  if (!recordLocator) {
    console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
    throw new Error('No active PNR');
  }

  if (!segmentNumber) {
    console.error('❌ Не указан segmentId для сохранения мест');
    alert('❌ Ошибка: не выбран сегмент.');
    return;
  }

  try {
    const { parsedData } = await loadPnrDetailsFromSabre();
    const passengers = parsedData.passengers || [];

    const seatsForCurrentSegment = selectedSeats.filter(
      seat => seat.segmentNumber === segmentNumber
    );

    if (!seatsForCurrentSegment.length) {
      console.warn(`⚠️ Нет выбранных мест для сегмента ${segmentNumber}`);
      alert(`⚠️ Нет выбранных мест для сегмента ${segmentNumber}`);
      return;
    }

    const seatTags = seatsForCurrentSegment
      .map(seat => {
        const pax = passengers.find(
          p => p.id === seat.passengerId || p.nameNumber === seat.passengerId
        );
        if (!pax || !pax.nameNumber || !seat.seatLabel) {
          console.warn(
            `⚠️ Пропущено назначение: пассажир=${seat.passengerId}, место=${seat.seatLabel}`
          );
          return null;
        }
        return `
          <Seat>
            <NameSelect NameNumber="${pax.nameNumber}"/>
            <SeatSelect Number="${seat.seatLabel}"/>
            <SegmentSelect Number="${segmentNumber}"/>
          </Seat>`.trim();
      })
      .filter(Boolean)
      .join('\n');

    if (!seatTags) {
      console.warn(`⚠️ Не удалось собрать валидные Seat элементы для сегмента ${segmentNumber}`);
      alert(`⚠️ Не удалось собрать валидные Seat элементы для сегмента ${segmentNumber}`);
      return;
    }

    const xml = `
      <AirSeatRQ Version="2.1.1"
        xmlns="http://webservices.sabre.com/sabreXML/2011/10"
        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Seats>
          ${seatTags}
        </Seats>
      </AirSeatRQ>
    `.trim();

    console.log('📤 Отправляем AirSeatRQ в Sabre:\n', xml);

    const response = await soap.callSws({
      action: 'AirSeatLLSRQ',
      payload: xml,
      authTokenType: 'SESSION',
    });

    console.log('📩 Ответ от Sabre:\n', response.value);

    if (response.value.includes('<Error')) {
      console.warn('⚠️ Ошибка в ответе от Sabre:\n', response.value);
      alert('❌ Ошибка при назначении мест. См. консоль.');
      return;
    }

    console.log('✅ Места успешно назначены.');
    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Ошибка при отправке AirSeatRQ:', error);
    alert('❌ Ошибка при назначении мест (AirSeatRQ). См. консоль.');
  }
};