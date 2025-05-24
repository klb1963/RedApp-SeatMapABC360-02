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

  try {
    // Load current PNR data from Sabre
    const { parsedData } = await loadPnrDetailsFromSabre();
    const passengers = parsedData.passengers || [];
    const segments = parsedData.segments || [];

    // Fallback to SegmentNumber "1" if not available
    const segmentNumber = segments[0]?.segmentNumber || '1';

    // Build XML for each seat assignment
    const seatElements = selectedSeats.map((seat) => {
      const pax = passengers.find(p => p.id === seat.passengerId || p.nameNumber === seat.passengerId);
      if (!pax || !seat.seatLabel) return '';

      return `
        <Seat BoardingPass="true">
          <NameSelect NameNumber="${pax.nameNumber}" />
          <SeatSelect Number="${seat.seatLabel}" />
          <SegmentSelect Number="${segmentNumber}" />
        </Seat>
      `.trim();
    }).filter(Boolean).join('\n');

    // Abort if no seat elements were built
    if (!seatElements) {
      alert('❗ No seats selected.');
      return;
    }

    // Build SOAP payload for AirSeatLLSRQ
    const xml = `
      <AirSeatRQ Version="2.1.1"
        xmlns="http://webservices.sabre.com/sabreXML/2011/10"
        xmlns:xs="http://www.w3.org/2001/XMLSchema"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <Seats>
          ${seatElements}
        </Seats>
      </AirSeatRQ>
    `.trim();

    console.log('📤 Sending AirSeatLLSRQ:\n', xml);

    // Send SOAP request using Sabre SDK
    const response = await soap.callSws({
      action: 'AirSeatLLSRQ',
      payload: xml,
      authTokenType: 'SESSION'
    });

    console.log('📩 Sabre response:\n', response.value);

    // Check response for success
    if (response.value.includes('<Success')) {
      console.log('✅ Seat assignment succeeded.');
      await pnrService.refreshData();
      modalService.closeReactModal();
    } else {
      console.warn('⚠️ Sabre did not return <Success>.');
      alert('Seat assignment failed. Check console for details.');
    }

  } catch (error) {
    console.error('❌ Error during AirSeatLLSRQ:', error);
    alert('An error occurred while assigning seats. See console for details.');
  }
};