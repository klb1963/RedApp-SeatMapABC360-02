// file: /code/utils/extractSegmentData.ts

/**
 * extractSegmentData.ts
 *
 * ✈️ Utility function for extracting structured flight segment data
 * from a Sabre `FlightSegment` object.
 *
 * This is typically used when preparing flight data for use in:
 * - pricing views
 * - availability tiles
 * - shopping workflows
 * - integration with shared context or React seat map components
 */

import { FlightSegment } from 'sabre-ngv-app/app/common/data/flight/FlightSegment';

/**
 * Extracts useful properties from a FlightSegment and returns them as a plain object.
 *
 * @param segment - Sabre's FlightSegment object from shopping or pricing context
 * @returns A flat object with selected fields for downstream processing
 */
export function extractSegmentData(segment: FlightSegment): Record<string, any> {
    return {
        // 🆔 Internal segment ID (often used as fallback for flightNumber)
        flightNumber: segment.getSegmentId(),

        // 🏷️ Airline operating the flight
        marketingCarrier: segment.getMarketingOperatingAirline(),

        // 📅 Raw departure date (not formatted)
        departureDate: segment.getRawDepartureDate(),

        // 💺 Booking class (RBD), or fallback if not selected
        rbd: segment.getSelectedBookingClass() || 'N/A',

        // 🌍 Departure and arrival IATA codes
        origin: segment.getOriginIata(),
        destination: segment.getDestinationIata(),

        // ✈️ Primary and alternative equipment codes (aircraft type)
        equipmentCode: segment.getEquipmentCode(),
        equipmentCodes: segment.getEquipmentCodes().map(codeInfo => String(codeInfo)),

        // 🔢 Segment RPH (Reference Place Holder — ordinal in itinerary)
        segmentRph: segment.getRph()
    };
}