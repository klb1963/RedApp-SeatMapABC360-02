import { useEffect } from 'react';

/**
 * 🧩 Hook to listen for seat map init errors from Quicket iframe.
 * Automatically logs and alerts if initialization failed.
 */
export function useSeatMapInitErrorLogger() {
  useEffect(() => {
    function handleSeatMapMessage(event: MessageEvent) {
      const data = event.data;

      if (data?.type === 'onSeatMapInited') {
        if (data.error) {
          console.error('❌ SeatMap init error:', data.error);
          alert('❌ Ошибка при инициализации карты мест:\n' + data.error);
        } else {
          console.log('✅ SeatMap инициализировалась без ошибок');
        }
      }
    }

    window.addEventListener('message', handleSeatMapMessage);
    return () => window.removeEventListener('message', handleSeatMapMessage);
  }, []);
}