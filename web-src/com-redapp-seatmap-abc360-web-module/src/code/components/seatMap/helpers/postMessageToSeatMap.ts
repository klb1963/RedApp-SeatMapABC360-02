import { SeatMapMessagePayload } from '../types/SeatMapMessagePayload';

/**
 * Posts a message to the embedded SeatMap iframe with updated passenger info.
 */
export function postMessageToSeatMap(payload: Partial<SeatMapMessagePayload>) {
  const iframe = document.querySelector('iframe');
  if (!iframe || !iframe.contentWindow) {
    console.warn('⚠️ SeatMap iframe not found or not ready.');
    return;
  }

  iframe.contentWindow.postMessage(
    {
      type: 'SEAT_MAP_UPDATE',
      payload,
    },
    '*'
  );
}