// file: /code/services/loadSeatMapFromSabre.ts

/**
 * loadSeatMapFromSabre.ts
 *
 * 💺 Loads seat map availability from Sabre using EnhancedSeatMapRQ (SOAP).
 *
 * This service builds and sends an EnhancedSeatMapRQ SOAP request to Sabre.
 * It includes flight and passenger data and receives a seat map XML response.
 * The XML is then parsed into structured availability data, including startRow and endRow,
 * which are used by the seat map UI for proper rendering.
 *
 * This is used in the SeatMap ABC360 RedApp in Availability, Shopping, and PNR contexts.
 */

import { getService } from '../Context';
import { ISoapApiService } from 'sabre-ngv-communication/interfaces/ISoapApiService';
import { PassengerOption } from '../utils/parsePnrData';
import { parseSeatMapResponse } from '../utils/parseSeatMapResponse';
import { AgentProfileService } from 'sabre-ngv-app/app/services/impl/AgentProfileService';
import { extractStartAndEndRowFromCabin } from '../utils/extractStartEndRow';
import { SeatInfo } from '../components/seatMap/types/SeatInfo';

/**
 * Interface describing the minimum flight segment information required
 * to request a seat map from Sabre.
 */
interface FlightSegment {
  bookingClass: string;
  marketingCarrier: string;
  marketingFlightNumber: string;
  flightNumber: string;
  departureDate: string;
  origin: string;
  destination: string;
  segmentNumber?: string; // Optional segment sequence number
}

/**
 * Sends EnhancedSeatMapRQ to Sabre and returns parsed seat map data.
 *
 * @param segment - flight segment info (incl. booking class, carrier, dates, etc.)
 * @param passengers - list of passengers on this segment
 * @returns Promise resolving to raw XML, enriched availability array, seat info array, and layout letters
 */
export const loadSeatMapFromSabre = async (
  segment: FlightSegment,
  passengers: PassengerOption[]
): Promise<{
  rawXml: string;
  availability: any[];
  seatInfo: SeatInfo[];
  layoutLetters: string[];
}> => {
  try {
    const soapApiService = getService(ISoapApiService);

    // Get PCC from agent profile (or fallback hardcoded)
    const agentService = getService(AgentProfileService);
    const pcc = agentService.getPcc() || 'DI9L';

    // Optional: <Passenger> elements for future use
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

    // Build SOAP payload
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

    // Send SOAP request to Sabre
    const response = await soapApiService.callSws({
      action: 'EnhancedSeatMapRQ',
      payload: soapPayload,
      authTokenType: 'SESSION'
    });

    // Parse Sabre XML response
    const rawXml = response.value;
    const xmlDoc = new DOMParser().parseFromString(rawXml, 'application/xml');

    const { availability, seatInfo, layoutLetters } = parseSeatMapResponse(xmlDoc);

    const { startRow, endRow } = extractStartAndEndRowFromCabin(xmlDoc);

    console.log('[🔍 extractStartAndEndRowFromCabin]', { startRow, endRow });

    // Enrich each availability entry with segment info and row boundaries
    const enrichedAvailability = availability.map(item => ({
      ...item,
      segmentNumber: segment.segmentNumber || '1',
      xml: rawXml,
      enhancedSeatMapXml: xmlDoc,
      startRow,
      endRow,
   }));

    console.log('✅ enrichedAvailability:', enrichedAvailability);

    return {
      rawXml,
      availability: enrichedAvailability,
      seatInfo,
      layoutLetters,
    };

  } catch (error) {
    console.error('❌ Error in loadSeatMapFromSabre:', error);
    return Promise.reject(error);
  }
};