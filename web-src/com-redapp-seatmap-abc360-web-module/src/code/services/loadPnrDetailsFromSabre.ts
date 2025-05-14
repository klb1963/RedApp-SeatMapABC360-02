// файл: code/components/loadPnrDetailsFromSabre.ts

import { getService } from '../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { parsePnrData, PnrData } from '../utils/parcePnrData';

/**
 * Load PNR data as Promise.
 */

export const loadPnrDetailsFromSabre = async (): Promise<{ parsedData: PnrData; rawXml: string }> => {
  try {
    const pnrService = getService(PnrPublicService);
    const soapApiService = getService(ISoapApiService);

    const recordLocator = pnrService.getRecordLocator();
    if (!recordLocator) {
      console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
      throw new Error('No active PNR');
    }

    const soapPayload = `
      <ns6:GetReservationRQ xmlns:ns6="http://webservices.sabre.com/pnrbuilder/v1_19" Version="1.19.22">
        <ns6:RequestType>Stateful</ns6:RequestType>
        <ns6:ReturnOptions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns6:ReturnOptions" UnmaskCreditCard="false" ShowTicketStatus="true">
          <ns6:ViewName>Full</ns6:ViewName>
          <ns6:ResponseFormat>STL</ns6:ResponseFormat>
        </ns6:ReturnOptions>
      </ns6:GetReservationRQ>
    `;

    const response = await soapApiService.callSws({
      action: 'GetReservationRQ',
      payload: soapPayload,
      authTokenType: 'SESSION'
    });

    const parsedData = parsePnrData(response.getParsedValue());
    const rawXml = response.value;

    // ✅ LOG for NameNumber (externalRef)
    console.log('✅ parsedData.passengers:', JSON.stringify(parsedData.passengers, null, 2));

    // 🔍 Show all segments
    console.log('🧩 Segments from parsed PNR Data [RAW]:', parsedData.segments);

    return { parsedData, rawXml };

  } catch (error) {
    console.error('❌ Error in loadPnrDetailsFromSabre:', error);
    throw error;
  }
};