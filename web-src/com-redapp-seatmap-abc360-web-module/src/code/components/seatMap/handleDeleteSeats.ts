// file: /code/components/seatMap/handleDeleteSeats.ts

/**
 * 🧹 handleDeleteSeats.ts
 *
 * This function sends an `AirSeatCancelRQ` request to Sabre to cancel all seat assignments in the current PNR.
 * - Checks if a valid PNR is active
 * - Asks for confirmation from the agent
 * - Sends the cancellation SOAP request
 * - Handles success and error states
 * 
 * Used in SeatMap ABC 360 to support "Delete Seats" action from UI.
 */

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

export const handleDeleteSeats = async (): Promise<void> => {
  // Get required Sabre Red App services
  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);
  const modalService = getService(PublicModalsService);

  // Ensure a PNR is active
  const recordLocator = pnrService.getRecordLocator();
  if (!recordLocator) {
    console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
    throw new Error('No active PNR');
  }

  // Ask user to confirm seat deletion
  const confirmed = window.confirm('❓ Are you sure you want to delete all seat assignments?');
  if (!confirmed) return;

  // Prepare XML payload for AirSeatCancelLLSRQ
  const xml = `
    <AirSeatCancelRQ Version="2.1.0" xmlns="http://webservices.sabre.com/sabreXML/2011/10">
      <Seats>
        <Seat All="true"/>
      </Seats>
    </AirSeatCancelRQ>
  `.trim();

  try {
    console.log('📤 Sending AirSeatCancelRQ to cancel all seats:\n', xml);

    // Send SOAP request to Sabre
    const response = await soap.callSws({
      action: 'AirSeatCancelLLSRQ',
      payload: xml,
      authTokenType: 'SESSION',
    });

    console.log('📩 Response from Sabre:\n', response.value);

    // Check for errors in the response
    if (response.value.includes('<Error')) {
      console.warn('⚠️ Error while cancelling seats:\n', response.value);
      alert('❌ Error while cancelling seats. Check the console.');
      return;
    }

    // Success: refresh PNR and close modal
    console.log('✅ Seats canceled in PNR.');
    await pnrService.refreshData();
    modalService.closeReactModal();

  } catch (error) {
    console.error('❌ Exception while cancelling seats:', error);
    alert('❌ Error while cancelling seats. See console for details.');
  }
};