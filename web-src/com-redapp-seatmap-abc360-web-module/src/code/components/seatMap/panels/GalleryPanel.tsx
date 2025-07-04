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

export const GalleryPanel: React.FC<GalleryPanelProps> = ({ config }) => {
  if (!config) return null;

  return (
    <div style={{ marginTop: '2rem', marginLeft: '0rem' }}>
      <strong>{config.title || 'Aircraft gallery'}:</strong>
      <div
        style={{
          marginTop: '1rem',
          border: '1px solid #ccc',
          width: '100%',
          height: '402px',
        }}
      >
        <iframe
          src="https://panorama.quicket.io/demo/media-viewer-app/"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Aircraft preview"
          allowFullScreen
        />
      </div>
    </div>
  );
};