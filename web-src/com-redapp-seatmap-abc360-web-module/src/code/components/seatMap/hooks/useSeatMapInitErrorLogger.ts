// file: /code/components/seatMap/hooks/useSeatMapInitErrorLogger.ts

import { useState, useEffect } from 'react';

/**
 * 🧩 Hook to listen for seat map initialization errors from the Quicket iframe.
 * Returns `true` if an initialization error was detected, otherwise `false`.
 * 
 * Adds debug logging to help track Quicket messages and prevent false fallback activation.
 */
export const useSeatMapInitErrorLogger = (): boolean => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;

      // Only handle messages from Quicket
      if (event.origin !== 'https://quicket.io') return;

      // ✅ Log all incoming messages from Quicket for debugging
      console.log('[SeatMapInit] Received message from Quicket:', data);

      // Handle object-style message with type "seatMaps"
      if (typeof data === 'object' && data?.type === 'seatMaps' && typeof data.onSeatMapInited === 'string') {
        try {
          const inner = JSON.parse(data.onSeatMapInited);

          // Only consider it an error if non-empty string is present
          if (inner?.error && typeof inner.error === 'string' && inner.error.trim() !== '') {
            console.error('+++ [SeatMap] +++ init error (object):', inner.error);
            setHasError(true);
          } else {
            console.log('[SeatMapInit] onSeatMapInited received with no error.');
          }
        } catch {
          console.error('+++ [SeatMap] +++ Failed to parse onSeatMapInited JSON.');
        }
        return;
      }

      // Handle plain string message
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed?.error && parsed.error.trim() !== '') {
            console.error('+++ [SeatMap] +++ init error (string):', parsed.error);
            setHasError(true);
          }
        } catch {
          if (data.includes('SeatMap init error')) {
            console.error('+++ [SeatMap] +++ fallback triggered by plain string message');
            setHasError(true);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return hasError;
};