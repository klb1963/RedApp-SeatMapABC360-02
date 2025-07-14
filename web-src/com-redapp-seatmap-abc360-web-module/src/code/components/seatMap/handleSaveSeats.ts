// file: /code/components/seatMap/handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { SeatAssignment } from './types/SeatAssigment';

/**
 * 🔄 handleSaveSeats
 *
 * Saves selected seat assignments for all segments in one AirSeatRQ.
 *
 *  @param selectedSeats array of SeatAssignment objects for all passengers & all segments
 */
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
      console.warn(`⚠️ No selected seats to save`);
      alert(`⚠️ No selected seats to save`);
      return;
    }

    console.log(`📋 Preparing to save ${selectedSeats.length} seat assignments in one AirSeatRQ…`);

    // 🪑 Собираем данные
    const nameNumbers = new Set<string>();
    const seatNumbers = new Set<string>();
    const segmentNumbers = new Set<string>();

    for (const seat of selectedSeats) {
      if (!seat.segmentNumber || !seat.seatLabel) {
        console.warn(`⚠️ Invalid seat assignment:`, seat);
        continue;
      }

      const pax = passengers.find(
        p => p.id === seat.passengerId || p.nameNumber === seat.passengerId
      );

      if (!pax || !pax.nameNumber) {
        console.warn(`⚠️ Passenger not found for:`, seat.passengerId);
        continue;
      }

      nameNumbers.add(pax.nameNumber);
      seatNumbers.add(seat.seatLabel);
      segmentNumbers.add(seat.segmentNumber);
    }

    if (nameNumbers.size === 0 || seatNumbers.size === 0 || segmentNumbers.size === 0) {
      alert('⚠️ Could not construct AirSeatRQ: missing names, seats or segments');
      return;
    }

    // 📝 Формируем XML
    const xml = `
      <AirSeatRQ Version="2.1.2"
        xmlns="http://webservices.sabre.com/sabreXML/2011/10"
        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Seats>
          <Seat>
            ${Array.from(nameNumbers).map(n => `<NameSelect NameNumber="${n}"/>`).join('\n')}
            ${Array.from(seatNumbers).map(s => `<SeatSelect Number="${s}"/>`).join('\n')}
            ${Array.from(segmentNumbers).map(s => `<SegmentSelect Number="${s}"/>`).join('\n')}
          </Seat>
        </Seats>
      </AirSeatRQ>
    `.trim();

    console.log('📤 Sending multi-segment AirSeatRQ XML:\n', xml);

    const response = await soap.callSws({
      action: 'AirSeatLLSRQ',
      payload: xml,
      authTokenType: 'SESSION',
    });

    console.log('📩 Response from Sabre:\n', response.value);

    if (response.value.includes('<Error')) {
      console.warn('⚠️ Error in Sabre response:\n', response.value);
      alert(`❌ Error assigning seats. See console.`);
    }

    console.log('✅ All seats successfully assigned.');
    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Error sending AirSeatRQ:', error);
    alert('❌ Error assigning seats (AirSeatRQ). See console.');
  }
};