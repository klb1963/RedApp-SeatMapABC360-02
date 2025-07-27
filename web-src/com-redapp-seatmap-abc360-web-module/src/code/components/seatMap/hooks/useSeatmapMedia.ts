/**
 * 🧩 Hook to listen for seat map init event from Quicket iframe and extract media data.
 *
 * Listens for a postMessage from the iframe containing initialization metadata.
 * Parses media (photo, pano, aircraft model), and returns { media, error }.
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
    // Event listener for messages from the Quicket iframe
    function handleSeatmapMessage(event: MessageEvent) {
      if (event.origin !== 'https://quicket.io') return; // ensure trusted origin
      const data = event.data;

      // Only proceed if message is seatMaps init event
      if (data?.type === 'seatMaps' && data?.onSeatMapInited) {
        console.log('📸 onSeatMapInited message received:', data);

        let parsed = data.onSeatMapInited;

        // Parse stringified JSON if needed
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            console.error('❌ Failed to parse onSeatMapInited JSON:', e);
            return;
          }
        }

        // Handle any error in the payload
        if (parsed.error) {
          console.error('❌ SeatMap init error:', parsed.error);
          setError(parsed.error);
        } else {
          setError(null);
        }

        // Handle media block
        if (parsed.media) {
          console.log('📸 media data received:', parsed.media);
        
          const enrichedMedia: IMediaData = {
            ...parsed.media,
          };
        
          // Attempt to enrich media title with aircraft model if missing
          if (!enrichedMedia.title) {
            if (parsed.aircraft?.model) {
              enrichedMedia.title = parsed.aircraft.model;
            } else if (parsed.aircraft?.name) {
              enrichedMedia.title = parsed.aircraft.name;
            } else {
              enrichedMedia.title = 'Aircraft gallery';
            }
          }
        
          setMedia(enrichedMedia);
        } else {
          console.log('ℹ️ No media data in message');
          setMedia(null);
        }
      }
    }

    // Subscribe to message events on mount
    window.addEventListener('message', handleSeatmapMessage);

    // Clean up listener on unmount
    return () => window.removeEventListener('message', handleSeatmapMessage);
  }, []);

  return { media, error };
}