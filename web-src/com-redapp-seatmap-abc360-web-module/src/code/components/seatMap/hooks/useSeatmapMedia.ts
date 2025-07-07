// file: /code/components/seatMap/hooks/useSeatmapMedia.ts

/**
 * 🧩 Hook to listen for seat map init event from Quicket iframe and extract media data.
 *
 * Returns `{ media, error }` — media content and init error if any.
 */

import { useEffect, useState } from 'react';

export interface IMediaData {
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

      if (data?.type === 'seatMaps' && data?.onSeatMapInited) {
        console.log('📸 onSeatMapInited message received:', data);

        let parsed = data.onSeatMapInited;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            console.error('❌ Failed to parse onSeatMapInited JSON:', e);
            return;
          }
        }

        if (parsed.error) {
          console.error('❌ SeatMap init error:', parsed.error);
          setError(parsed.error);
        } else {
          setError(null);
        }

        if (parsed.media) {
          console.log('📸 media data received:', parsed.media);
        
          const enrichedMedia: IMediaData = {
            ...parsed.media,
          };
        
          // Попробуем вытащить модель самолета из других данных от библиотеки
          if (!enrichedMedia.title) {
            if (parsed.aircraft?.model) {
              enrichedMedia.title = parsed.aircraft.model;
            } else if (parsed.aircraft?.name) {
              enrichedMedia.title = parsed.aircraft.name;
            } else {
              enrichedMedia.title = 'Aircraft galery';
            }
          }
        
          setMedia(enrichedMedia);
        } else {
          console.log('ℹ️ No media data in message');
          setMedia(null);
        }
      }
    }

    window.addEventListener('message', handleSeatmapMessage);
    return () => window.removeEventListener('message', handleSeatmapMessage);
  }, []);

  return { media, error };
}