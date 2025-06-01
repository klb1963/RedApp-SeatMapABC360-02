// file: /code/components/seatMap/handleResetSeats.ts

/**
 * 🔄 handleResetSeats.ts
 *
 * Sends an `AirSeatLLSRQ` request to reset (remove) all seat assignments 
 * for all passengers in the active PNR. This is a per-passenger, per-segment seat removal,
 * unlike `AirSeatCancelRQ`, which performs a blanket removal.
 *
 * Used in SeatMap ABC 360 when an agent clicks "Reset Seats".
 */

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { SelectedSeat } from './SeatMapComponentBase';

export const handleResetSeats = async (): Promise<void> => {
  // Retrieve RedApp services
  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  // Check for active PNR
  const recordLocator = pnrService.getRecordLocator();
  if (!recordLocator) {
    console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
    throw new Error('No active PNR');
  }

  try {
    // Ask for confirmation before resetting
    const confirmed = window.confirm('❓ Are you sure you want to reset all seat assignments?');
    if (!confirmed) return;

    // Load current PNR to get passenger and segment data
    const { parsedData } = await loadPnrDetailsFromSabre();
    const passengers = parsedData.passengers || [];
    const segments = parsedData.segments || [];

    // Use the first segment number as target (can be extended to multiple)
    const segmentNumber = segments?.[0]?.segmentNumber ?? '1';

    // Generate XML for seat removal (per passenger)
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

    // Final XML request
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

    // Send SOAP request
    const response = await soap.callSws({
      action: 'AirSeatLLSRQ',
      payload: xml,
      authTokenType: 'SESSION',
    });

    console.log('📩 Response from Sabre (reset):\n', response.value);

    // Handle errors in response
    if (response.value.includes('<Error')) {
      console.warn('⚠️ Error while resetting seats:\n', response.value);
      alert('❌ Error while resetting seats. See console.');
      return;
    }

    // On success: refresh PNR and close modal
    console.log('✅ Seats reset successfully.');
    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Exception while resetting seats:', error);
    alert('❌ Error while resetting seats (AirSeatRQ).');
  }
};