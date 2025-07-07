// file: components/seatMap/panels/GalleryPanel.tsx

import * as React from 'react';

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

    const handleLoad = () => {
      const message = {
        type: MESSAGE_TYPES.MEDIA_VIEWER,
        config: JSON.stringify(config),
      };

      iframe.contentWindow?.postMessage(message, iframe.src);
      console.log('[GalleryPanel] sent config to iframe', message);
    };

    iframe.addEventListener('load', handleLoad);

    const messageListener = (event: MessageEvent) => {
      if (event.data?.type === MESSAGE_TYPES.MEDIA_VIEWER) {
        console.log('[GalleryPanel] message from iframe', event.data);
        if (event.data.eventType === 'onClose') {
          console.log('[GalleryPanel] onClose event received');
          // здесь можно вызвать колбэк или обновить стейт родителя
        }
      }
    };

    window.addEventListener('message', messageListener);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      window.removeEventListener('message', messageListener);
    };
  }, [config]);

  if (!config) return null;

  return (
    <div style={{ marginTop: '2rem', marginLeft: '0rem' }}>
      <strong>{'Aircraft gallery'}:</strong>
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