// file: code/components/seatMap/handleCancelSpecificSeat.ts

/**
 * 🧹 handleCancelSpecificSeat.ts
 *
 * Sends an `AirSeatCancelLLSRQ` request to cancel a specific seat assignment
 * for a given passenger and segment.
 *
 * Used in SeatMap ABC 360 when an agent clicks the ❌ icon next to a seat.
 */

import { getService } from '../../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';

interface CancelSeatOptions {
  nameNumber: string; // e.g., "1.1"
  segmentNumber: string; // e.g., "2"
}

export const handleCancelSpecificSeat = async ({ nameNumber, segmentNumber }: CancelSeatOptions): Promise<boolean> => {
  const soap = getService(ISoapApiService);
  const pnrService = getService(PnrPublicService);

  const recordLocator = pnrService.getRecordLocator();
  if (!recordLocator) {
    console.warn('⚠️ No active PNR.');
    return false;
  }

  const xml = `
    <AirSeatCancelRQ Version="2.1.0" xmlns="http://webservices.sabre.com/sabreXML/2011/10">
      <Seats>
        <Seat>
          <NameSelect NameNumber="${nameNumber}" />
          <SegmentSelect Number="${segmentNumber}" />
        </Seat>
      </Seats>
    </AirSeatCancelRQ>
  `.trim();

  try {
    console.log('📤 Sending specific AirSeatCancelRQ:\n', xml);

    const response = await soap.callSws({
      action: 'AirSeatCancelLLSRQ',
      payload: xml,
      authTokenType: 'SESSION',
    });

    console.log('📩 Response from Sabre:\n', response.value);

    if (response.value.includes('<Error')) {
      alert('❌ Error while cancelling seat.');
      return false;
    }

    await pnrService.refreshData();
    return true;
  } catch (e) {
    console.error('❌ Exception during seat cancel:', e);
    return false;
  }
};
