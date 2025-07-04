/**
 * 🧩 Hook to listen for seat map init errors from Quicket iframe.
 * Returns `error` string if initialization failed, otherwise null.
 */

import { useEffect, useState } from 'react';

export function useSeatMapInitErrorLogger() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleSeatMapMessage(event: MessageEvent) {
      const data = event.data;

      if (data?.type === 'onSeatMapInited') {
        if (data.error) {
          console.error('❌ SeatMap init error:', data.error);
          setError(data.error);
        } else {
          console.log('✅ SeatMap инициализировалась без ошибок');
          setError(null);
        }
      }
    }

    window.addEventListener('message', handleSeatMapMessage);
    return () => window.removeEventListener('message', handleSeatMapMessage);
  }, []);

  return error;
}