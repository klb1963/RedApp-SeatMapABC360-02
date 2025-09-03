// file: /code/components/seatMap/handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { SeatAssignment } from './types/SeatAssigment';

export const handleSaveSeats = async (
  selectedSeats: SeatAssignment[],
): Promise<void> => {
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

    if (!selectedSeats.length) {
      console.warn('⚠️ No selected seats to save');
      alert('⚠️ No selected seats to save');
      return;
    }

    console.log(`📋 Preparing to save ${selectedSeats.length} seat assignments across all segments…`);

    // 1) Группируем по сегментам, как раньше
    const segmentsMap = new Map<string, SeatAssignment[]>();
    for (const seat of selectedSeats) {
      if (!segmentsMap.has(seat.segmentNumber)) segmentsMap.set(seat.segmentNumber, []);
      segmentsMap.get(seat.segmentNumber)!.push(seat);
    }

    // 2) По сегменту → по каждому назначению шлём ОТДЕЛЬНЫЙ AirSeatRQ
    for (const [segmentNumber, seatsForSegment] of Array.from(segmentsMap.entries())) {
      for (const seat of seatsForSegment) {
        // ищем пассажира и валидируем входные
        const pax = passengers.find(
          p => p.id === seat.passengerId || p.nameNumber === seat.passengerId
        );

        if (!pax || !pax.nameNumber || !seat.seatLabel) {
          console.warn(`⚠️ Skipping invalid seat assignment: pax=${seat.passengerId}, seat=${seat.seatLabel}, seg=${segmentNumber}`);
          continue;
        }

        const xml = `
          <AirSeatRQ Version="2.1.2"
            xmlns="http://webservices.sabre.com/sabreXML/2011/10"
            xmlns:xs="http://www.w3.org/2001/XMLSchema"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <Seats>
              <Seat>
                <NameSelect NameNumber="${pax.nameNumber}"/>
                <SeatSelect Number="${seat.seatLabel}"/>
                <SegmentSelect Number="${segmentNumber}"/>
              </Seat>
            </Seats>
          </AirSeatRQ>
        `.trim();

        console.log(`📤 Sending AirSeatRQ (seg ${segmentNumber}, pax ${pax.nameNumber} → seat ${seat.seatLabel}):\n`, xml);

        const resp = await soap.callSws({
          action: 'AirSeatLLSRQ',
          payload: xml,
          authTokenType: 'SESSION',
        });

        const body = resp?.value ?? '';
        if (!body.includes('ApplicationResults status="Complete"') || body.includes('<Error')) {
          console.warn(`❌ Error in AirSeatRS (seg ${segmentNumber}, pax ${pax.nameNumber}, seat ${seat.seatLabel}):\n`, body);
          // продолжаем дальше, чтобы попытаться посадить остальных
        } else {
          console.log(`✅ Seat assigned (seg ${segmentNumber}, pax ${pax.nameNumber} → ${seat.seatLabel})`);
        }
      }
    }

    // 3) Обновляем Trip Summary и закрываем модалку
    await pnrService.refreshData();
    modalService.closeReactModal();

    console.log('✅ All seat assignments processed.');

  } catch (e) {
    console.error('❌ Error assigning seats:', e);
    alert('❌ Error assigning seats (see console).');
  }
};