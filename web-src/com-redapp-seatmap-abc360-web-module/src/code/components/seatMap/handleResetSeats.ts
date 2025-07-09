// file: /code/components/seatMap/handleResetSeats.ts

/**
 * 🔄 handleResetSeats.ts
 *
 * Sends an `AirSeatLLSRQ` request to reset (remove) all seat assignments 
 * for all passengers on the specified segment in the active PNR.
 *
 * Used in SeatMap ABC 360 when an agent clicks "Reset Seats".
 */

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';

/**
 * Resets all seat assignments on a specific segment.
 * @param onRefresh Optional callback to trigger after successful reset and PNR refresh
 * @param passedSegmentNumber Optional segment number to reset. Defaults to first segment if not specified.
 */
export const handleResetSeats = async (
  onRefresh?: () => void,
  passedSegmentNumber?: string
): Promise<boolean> => {
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
    const confirmed = window.confirm(
      '❓ Are you sure you want to reset all seat assignments on the selected segment?'
    );
    if (!confirmed) return;

    // Load current PNR to get passenger and segment data
    const { parsedData } = await loadPnrDetailsFromSabre();
    const passengers = parsedData.passengers || [];
    const segments = parsedData.segments || [];

    // Use the passed segment number or default to the first segment
    const segmentNumberToReset =
      passedSegmentNumber || segments?.[0]?.segmentNumber || '1';

    console.log(
      `♻️ Resetting seats on segment #${segmentNumberToReset} for ${passengers.length} passenger(s).`
    );

    // Generate XML for seat removal (per passenger)
    const seatRemovalTags = passengers
      .map((pax) => {
        if (!pax.nameNumber) return '';
        return `
          <Seat>
            <NameSelect NameNumber="${pax.nameNumber}" />
            <SeatSelect />
            <SegmentSelect Number="${segmentNumberToReset}" />
          </Seat>
        `;
      })
      .join('\n');

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
      return false;
    }

    // On success: refresh PNR and notify UI
    console.log('✅ Seats reset successfully on segment', segmentNumberToReset);
    await pnrService.refreshData();

    onRefresh?.();

  } catch (error) {
    console.error('❌ Exception while resetting seats:', error);
    alert('❌ Error while resetting seats (AirSeatRQ).');
  }
};