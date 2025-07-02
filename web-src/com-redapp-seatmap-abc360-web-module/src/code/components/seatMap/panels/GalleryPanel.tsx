// file: components/seatMap/panels/GalleryPanel.tsx

import * as React from 'react';

export const GalleryPanel: React.FC = () => {
  return (
    <div style={{ marginTop: '2rem', marginLeft: '0rem' }}>
      <strong>Aircraft gallery:</strong>
      <div style={{ marginTop: '0.5rem', border: '1px solid #ccc', width: '452px', height: '402px' }}>
        <iframe
          src="https://panorama.quicket.io/demo/media-viewer/"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Aircraft preview"
          allowFullScreen
        />
      </div>
    </div>
  );
};