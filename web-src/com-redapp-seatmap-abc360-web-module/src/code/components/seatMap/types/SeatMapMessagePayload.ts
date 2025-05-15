// file: code/components/seatMap/types/SeatMapMessagePayload.ts

/**
 * SeatMapMessagePayload.ts
 * 
 * 📦 Interface defining the message structure used to communicate with the embedded SeatMap iframe
 * via the `postMessage()` API.
 * 
 * This payload is serialized (stringified) and sent from the RedApp frontend to the seat map rendering
 * library (e.g., quicket.io) to initialize or update the visual seat map.
 */

export interface SeatMapMessagePayload {
  /**
   * Message type identifier (expected: 'seatMaps')
   * Used by the iframe to distinguish message purpose.
   */
  type: string;

  /**
   * JSON string containing SeatMap configuration (e.g., seatMapId, layout preferences, styles).
   */
  config: string;

  /**
   * JSON string representing flight data (segment origin, destination, date, flight number, etc.)
   */
  flight: string;

  /**
   * JSON string of seat availability information.
   * Includes seat status (available, occupied, chargeable, etc.)
   */
  availability: string;

  /**
   * JSON string of the passenger list for visual rendering.
   * Each passenger includes name, seat assignment, label, initials, and interaction flags.
   */
  passengers: string;

  /**
   * Active deck index (as string).
   * Required for multi-deck aircraft support; default is usually "0".
   */
  currentDeckIndex: string;
}