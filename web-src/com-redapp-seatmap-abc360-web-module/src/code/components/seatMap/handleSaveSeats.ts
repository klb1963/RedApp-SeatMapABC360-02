// file: /code/components/seatMap/handleSaveSeats.ts

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { SelectedSeat } from './SeatMapComponentBase';

/**
 * 🔄 handleSaveSeats
 *
 * Saves selected seat assignments for the given segment.
 * Sends one AirSeatRQ per passenger per seat (Sabre requires separate requests).
 *
 * @param selectedSeats array of SelectedSeat objects for all passengers
 * @param segmentNumber sequence number of the segment to save seats for
 */
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

  try {
    const { parsedData } = await loadPnrDetailsFromSabre();
    const passengers = parsedData.passengers || [];

    if (!selectedSeats.length) {
      console.warn(`⚠️ No selected seats to save`);
      alert(`⚠️ No selected seats to save`);
      return;
    }

    // 🪑 For each passenger & seat
    for (const seat of selectedSeats) {
      if (!seat.segmentNumber) {
        console.warn(`⚠️ Missing segmentNumber for seat:`, seat);
        continue;
      }

      const pax = passengers.find(
        p => p.id === seat.passengerId || p.nameNumber === seat.passengerId
      );
      if (!pax || !pax.nameNumber || !seat.seatLabel) {
        console.warn(`⚠️ Skipping invalid seat assignment: passenger=${seat.passengerId}, seat=${seat.seatLabel}`);
        continue;
      }

      const xml = `
             <AirSeatRQ Version="2.1.1"
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

      console.log('📤 Sending AirSeatRQ to Sabre:\n', xml);

      const response = await soap.callSws({
        action: 'AirSeatLLSRQ',
        payload: xml,
        authTokenType: 'SESSION',
      });

      console.log('📩 Response from Sabre:\n', response.value);

      if (response.value.includes('<Error')) {
        console.warn('⚠️ Error in Sabre response:\n', response.value);
        alert(`❌ Error assigning seat ${seat.seatLabel} for passenger ${pax.surname}/${pax.givenName}`);
      }
    }

    console.log('✅ All seats successfully assigned.');
    await pnrService.refreshData(); 
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Error sending AirSeatRQ:', error);
    alert('❌ Error assigning seats (AirSeatRQ). See console.');
  }
};