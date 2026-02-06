/**
 * Aircraft GalleryPanel
 *
 * Displays an iframe with 360° aircraft gallery media.
 * Sends configuration via postMessage to the embedded iframe once it's loaded.
 * Listens to messages from the iframe (e.g. onClose events).
 */

import * as React from 'react';
import { t } from '../../../Context';
import { logger } from '../../../utils/logger';

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

const VIEWER_ORIGIN = 'https://panorama.quicket.io';

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ config }) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  React.useEffect(() => {
    if (!iframeRef.current || !config) return;

    const iframe = iframeRef.current;

    // 📤 Send configuration to iframe after it loads

    const handleLoad = () => {

      // Viewer ожидает строку (внутри вызывает .trim()).
      // Поэтому config отправляем JSON-строкой.
      let safeConfig = '{}';
      try {
        safeConfig = JSON.stringify(config);
      } catch {
        logger.warn('GalleryPanel: failed to stringify config');
      }
      
      const message = { type: MESSAGE_TYPES.MEDIA_VIEWER, config: safeConfig };

      iframe.contentWindow?.postMessage(message, VIEWER_ORIGIN);
      logger.debug('GalleryPanel: config posted', {
        photos: Array.isArray(config.photoData) ? config.photoData.length : 0,
        panos: Array.isArray(config.panoData) ? config.panoData.length : 0,
      });

    };

    iframe.addEventListener('load', handleLoad);

    // 📥 Listen to messages from iframe (e.g. onClose events)
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== VIEWER_ORIGIN) return;
      const data = event.data;
      if (data?.type !== MESSAGE_TYPES.MEDIA_VIEWER) return;
      if (data.eventType === 'onClose') logger.info('GalleryPanel: onClose event received');
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