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
      const data = event.data;
    
      // origin можно тоже проверить, как в useSeatmapMedia
      if (event.origin !== 'https://quicket.io') return;
    
      if (typeof data === 'object' && data?.type === 'seatMaps' && typeof data.onSeatMapInited === 'string') {
        try {
          const inner = JSON.parse(data.onSeatMapInited);
          if (inner?.error) {
            console.error('+++ [SeatMap] +++ init error detected (object):', inner.error);
            setHasError(true);
          }
        } catch {
          console.error('+++ [SeatMap] +++ failed to parse onSeatMapInited');
        }
        return;
      }
    
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed?.error) {
            console.error('+++ [SeatMap] +++ init error detected (string):', parsed.error);
            setHasError(true);
          }
        } catch {
          if (data.includes('SeatMap init error')) {
            console.error(data);
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