// file: /code/components/seatMap/hooks/useSeatmapMedia.ts

/**
 * 🧩 Hook to listen for seat map init event from Quicket iframe and extract media data.
 *
 * Returns `{ media, error }` — media content and init error if any.
 */

import { useEffect, useState } from 'react';

interface IMediaData {
  title?: string;
  photoData?: any[];
  panoData?: any[];
  [key: string]: any;
}

interface UseSeatmapMediaResult {
  media: IMediaData | null;
  error: string | null;
}

export function useSeatmapMedia(): UseSeatmapMediaResult {
  const [media, setMedia] = useState<IMediaData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function handleSeatmapMessage(event: MessageEvent) {
      if (event.origin !== 'https://quicket.io') return;
      const data = event.data;

      if (data?.type === 'onSeatMapInited') {
        if (data.error) {
          console.error('❌ SeatMap init error:', data.error);
          setError(data.error);
        } else {
          setError(null);
        }

        if (data.media) {
          setMedia(data.media);
        } else {
          setMedia(null);
        }
      }
    }

    window.addEventListener('message', handleSeatmapMessage);
    return () => window.removeEventListener('message', handleSeatmapMessage);
  }, []);

  return { media, error };
}