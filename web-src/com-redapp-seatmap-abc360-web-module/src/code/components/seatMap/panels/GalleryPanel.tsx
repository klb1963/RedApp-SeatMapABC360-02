// file: components/seatMap/panels/GalleryPanel.tsx

import * as React from 'react';

export const GalleryPanel: React.FC = () => {
  return (
    <div style={{ marginTop: '1rem', marginLeft: '10px'  }}>
      <strong>Aircraft gallery:</strong>
      <div style={{ marginTop: '0.5rem', border: '1px solid #ccc', height: '240px' }}>
        <iframe
          src="about:blank"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Aircraft preview"
        />
      </div>
    </div>
  );
};