/**
 * Aircraft GalleryPanel
 *
 * Displays an iframe with 360° aircraft gallery media.
 * Sends configuration via postMessage to the embedded iframe once it's loaded.
 * Listens to messages from the iframe (e.g. onClose events).
 */

import * as React from 'react';
import { t } from '../../../Context';

interface GalleryPanelProps {
  config?: {
    title?: string;
    photoData?: any[];
    panoData?: any[];
    [key: string]: any;
  };
}

const MESSAGE_TYPES = {
  MEDIA_VIEWER: 'mediaViewer',
};

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ config }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (!iframeRef.current || !config) return;

    const iframe = iframeRef.current;

    // 📤 Send configuration to iframe after it loads
    const handleLoad = () => {
      const message = {
        type: MESSAGE_TYPES.MEDIA_VIEWER,
        config: JSON.stringify(config),
      };

      iframe.contentWindow?.postMessage(message, iframe.src);
      console.log('[GalleryPanel] sent config to iframe', message);
    };

    iframe.addEventListener('load', handleLoad);

    // 📥 Listen to messages from iframe (e.g. onClose events)
    const messageListener = (event: MessageEvent) => {
      if (event.data?.type === MESSAGE_TYPES.MEDIA_VIEWER) {
        console.log('[GalleryPanel] message from iframe', event.data);
        if (event.data.eventType === 'onClose') {
          console.log('[GalleryPanel] onClose event received');
          // Optionally: trigger a callback or update parent state here
        }
      }
    };

    window.addEventListener('message', messageListener);

    // 🧹 Cleanup event listeners
    return () => {
      iframe.removeEventListener('load', handleLoad);
      window.removeEventListener('message', messageListener);
    };
  }, [config]);

  if (!config) return null;

  return (
    <div style={{ marginTop: '2rem', marginLeft: '0rem' }}>
      <strong>{t('seatMap.aircraftGallery') || 'Aircraft gallery'}:</strong>
      <div
        style={{
          marginTop: '1rem',
          border: '1px solid #ccc',
          width: '100%',
          height: '502px',
        }}
      >
        <iframe
          ref={iframeRef}
          src="https://panorama.quicket.io/demo/media-viewer-app/"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Aircraft preview"
          allowFullScreen
        />
      </div>
    </div>
  );
};