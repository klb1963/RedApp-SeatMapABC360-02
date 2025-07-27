// file: code/components/seatMap/types/SeatMapMessagePayload.ts

/**
 * SeatMapMessagePayload.ts
 * 
 * 📦 Interface defining the message structure used to communicate with the embedded SeatMap iframe
 * via the `postMessage()` API.
 * 
 * The payload is sent from the RedApp frontend to the seat map rendering library (e.g., quicket.io)
 * to initialize or update the seat map display.
 * 
 * All payload fields (except `type` and `currentDeckIndex`) are stringified JSON objects.
 */

export interface SeatMapMessagePayload {
  /**
   * Message type identifier.
   * Expected value: 'seatMaps'.
   * Used by the iframe to recognize incoming messages.
   */
  type: string;

  /**
   * JSON string representing seat map configuration (e.g., seatMapId, layout settings).
   */
  config: string;

  /**
   * JSON string describing the flight (origin, destination, airline, flight number, etc.)
   */
  flight: string;

  /**
   * JSON string of seat availability (status, price, etc.).
   * Optional.
   */
  availability?: string;

  /**
   * JSON string of passengers with labels, initials, colors, and assigned seats.
   * Optional.
   */
  passengers?: string;

  /**
   * Index of the currently active deck (multi-deck aircraft support).
   * Format: stringified integer, e.g. "0"
   */
  currentDeckIndex: string;
}