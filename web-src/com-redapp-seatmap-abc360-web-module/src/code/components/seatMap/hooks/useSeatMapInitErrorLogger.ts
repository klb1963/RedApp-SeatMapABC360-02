// file: /code/components/seatMap/hooks/useSeatMapInitErrorLogger.ts

/**
 * 🧩 Hook to listen for seat map init errors from Quicket iframe.
 * Returns `true` if initialization failed, otherwise `false`.
 */

import { useState, useEffect } from 'react';

export const useSeatMapInitErrorLogger = (): boolean => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'string') return;
      if (event.data.includes('SeatMap init error')) {
        console.error(event.data);
        setHasError(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return hasError;
};