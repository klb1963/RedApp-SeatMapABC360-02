// file: /code/services/loadSeatMapFromSabre.ts

/**
 * loadSeatMapFromSabre.ts
 * 
 * 💺 Load seat map availability from Sabre using EnhancedSeatMapRQ (SOAP).
 * 
 * This service constructs and sends an EnhancedSeatMapRQ request to the Sabre SOAP API.
 * It includes flight and passenger data and receives seat availability in response.
 * The XML response is parsed to extract availability for rendering in the seat map UI.
 * 
 * Used in the SeatMap ABC360 RedApp for Availability, Shopping, and PNR scenarios.
 */

import { getService } from '../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PassengerOption } from '../utils/parcePnrData';
import { parseSeatMapResponse } from '../utils/parseSeatMapResponse';
import { AgentProfileService } from 'sabre-ngv-app/app/services/impl/AgentProfileService';
import { sendXmlToUploader } from './sendXmlToUploader';

// ✈️ Interface for the flight segment passed into the seat map request
interface FlightSegment {
  bookingClass: string;
  marketingCarrier: string;
  marketingFlightNumber: string;
  flightNumber: string;
  departureDate: string;
  origin: string;
  destination: string;
}

// 🔧 Main function to send EnhancedSeatMapRQ and parse response
export const loadSeatMapFromSabre = async (
  segment: FlightSegment,
  passengers: PassengerOption[]
): Promise<{ rawXml: string; availability: any }> => {
  try {
    const soapApiService = getService(ISoapApiService);

    // 📌 Retrieve PCC from agent profile (fallback hardcoded if needed)
    const agentService = getService(AgentProfileService);
    const pcc = agentService.getPcc() || 'DI9L';

    // 👥 Compose <Passenger> elements for the request (not required, but included for future use)
    const passengerXml = passengers
      .map(
        (p, index) => `
        <Passenger id="${p.value}">
          <Name>
            <Given>${p.givenName.split(' ')[0]}</Given>
            <Surname>${p.surname}</Surname>
          </Name>
          <PTC>ADT</PTC>
        </Passenger>
      `
      )
      .join('');

    // 📤 Construct full EnhancedSeatMapRQ payload with flight, RBD, and FareAvailQualifiers
    const soapPayload = `
    <ns4:EnhancedSeatMapRQ xmlns:ns4="http://stl.sabre.com/Merchandising/v8">
      <ns4:SeatMapQueryEnhanced>
        <ns4:RequestType>Payload</ns4:RequestType>

        <ns4:Flight origin="${segment.origin}" destination="${segment.destination}">
          <ns4:DepartureDate>${segment.departureDate}</ns4:DepartureDate>
          <ns4:Marketing carrier="${segment.marketingCarrier}">${parseInt(segment.marketingFlightNumber, 10)}</ns4:Marketing>
        </ns4:Flight>

        <ns4:CabinDefinition>
          <ns4:RBD>${segment.bookingClass}</ns4:RBD>
        </ns4:CabinDefinition>

        ${passengers
          .map(
            (p, index) => `
          <ns4:FareAvailQualifiers fareBasisCode="TESTFARE" passengerType="ADT">
            <ns4:TravellerID>${index + 1}</ns4:TravellerID>
            <ns4:GivenName>${p.givenName.split(' ')[0]}</ns4:GivenName>
            <ns4:Surname>${p.surname}</ns4:Surname>
          </ns4:FareAvailQualifiers>
        `
          )
          .join('')}

        <ns4:POS multiHost="${segment.marketingCarrier}" company="${segment.marketingCarrier}">
          <ns4:Actual city="${segment.origin}"/>
          <ns4:PCC>${pcc}</ns4:PCC>
          <ns4:ClientContext clientType="SSW_RES"/>
        </ns4:POS>
      </ns4:SeatMapQueryEnhanced>
    </ns4:EnhancedSeatMapRQ>
    `;

    console.log('🚀 Sending EnhancedSeatMapRQ:\n', soapPayload);

    // 📡 Send request to Sabre SOAP API
    const response = await soapApiService.callSws({
      action: 'EnhancedSeatMapRQ',
      payload: soapPayload,
      authTokenType: 'SESSION'
    });

    // 📥 Get raw XML response and parse it for availability info
    const rawXml = response.value;

    try {
      await sendXmlToUploader(rawXml);
    } catch (err) {
      console.warn('⚠️ Failed to send EnhancedSeatMap XML to external uploader:', err);
    }

    const xmlDoc = new DOMParser().parseFromString(rawXml, 'application/xml');
    const { availability } = parseSeatMapResponse(xmlDoc);

    // ✅ Return both raw XML and parsed availability
    return { rawXml, availability };

  } catch (error) {
    console.error('❌ Error in loadSeatMapFromSabre:', error);
    return Promise.reject(error);
  }
};