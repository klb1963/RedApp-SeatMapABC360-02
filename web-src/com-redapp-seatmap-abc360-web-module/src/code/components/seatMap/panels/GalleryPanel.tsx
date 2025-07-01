// file: components/seatMap/panels/GalleryPanel.tsx

import * as React from 'react';

export const GalleryPanel: React.FC = () => {
  return (
    <div style={{ marginTop: '1rem', marginLeft: '10px' }}>
      <strong>Aircraft gallery:</strong>
      <div style={{ marginTop: '0.5rem', border: '1px solid #ccc', width: '460px', height: '300px' }}>
        <iframe
          src="https://panorama.quicket.io/demo/media-viewer/"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Aircraft preview"
        />
      </div>
    </div>
  );
};