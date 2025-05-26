// file: /code/services/loadPnrDetailsFromSabre.ts

/**
 * loadPnrDetailsFromSabre.ts
 * 
 * 📦 Load and parse current active PNR from Sabre Red 360 using SOAP API.
 * 
 * This service function sends a `GetReservationRQ` request to retrieve the current PNR,
 * parses the STL (structured) response using a helper `parsePnrData`,
 * and returns both parsed and raw XML representations of the PNR.
 * 
 * Used in SeatMap ABC360 for extracting passenger, segment, and seat assignment info.
 */

import { getService } from '../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PnrPublicService } from 'sabre-ngv-app/app/services/impl/PnrPublicService';
import { parsePnrData, PnrData } from '../utils/parcePnrData';

export const loadPnrDetailsFromSabre = async (): Promise<{ parsedData: PnrData; rawXml: string }> => {
  try {
    // 🔌 Get required Sabre services
    const pnrService = getService(PnrPublicService);
    const soapApiService = getService(ISoapApiService);

    // 🔎 Get the current record locator (PNR code)
    const recordLocator = pnrService.getRecordLocator();
    if (!recordLocator) {
      console.warn('⚠️ No active PNR. Please create or retrieve a PNR first.');
      throw new Error('No active PNR');
    }

    // 📨 Compose the SOAP payload for GetReservationRQ
    const soapPayload = `
      <ns6:GetReservationRQ xmlns:ns6="http://webservices.sabre.com/pnrbuilder/v1_19" Version="1.19.22">
        <ns6:RequestType>Stateful</ns6:RequestType>
        <ns6:ReturnOptions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns6:ReturnOptions" UnmaskCreditCard="false" ShowTicketStatus="true">
          <ns6:ViewName>Full</ns6:ViewName>
          <ns6:ResponseFormat>STL</ns6:ResponseFormat>
        </ns6:ReturnOptions>
      </ns6:GetReservationRQ>
    `;

    // 📡 Send the SOAP request via Sabre's SWS API
    const response = await soapApiService.callSws({
      action: 'GetReservationRQ',
      payload: soapPayload,
      authTokenType: 'SESSION'
    });

    // 🧩 Parse the returned STL object into structured JavaScript data
    const parsedData = parsePnrData(response.getParsedValue());
    const rawXml = response.value;
    
    console.log('[🧪] XML получен, начинаем парсить');
    console.log('✅ parsedData.passengers:', JSON.stringify(parsedData.passengers, null, 2));
    console.log('[🧪] После парсинга:', parsedData);
    // 🧩 Debug output: all flight segments
    console.log('🧩 Segments from parsed PNR Data [RAW]:', parsedData.segments);

    // 📤 Return both structured and raw versions
    return { parsedData, rawXml };

    
   

  } catch (error) {
    console.error('❌ Error in loadPnrDetailsFromSabre:', error);
    throw error;
  }
};