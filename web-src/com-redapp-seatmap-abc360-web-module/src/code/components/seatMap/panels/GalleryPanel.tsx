// file: components/seatMap/panels/GalleryPanel.tsx

import * as React from 'react';
import './GalleryPanel.css';

import {context} from '../../../Context';

const moduleBaseUrl = context.getModule().getManifest().url;
const assetsBaseUrl = `${moduleBaseUrl}/assets/images`;

const images = [
    { src: `${assetsBaseUrl}/s1.jpg`, alt: 'Business class view 1' },
    { src: `${assetsBaseUrl}/s2.jpg`, alt: 'Business class view 2' },
    { src: `${assetsBaseUrl}/s3.jpg`, alt: 'Business class view 3' },
    { src: `${assetsBaseUrl}/s4.jpg`, alt: 'Business class view 4' },
    { src: `${assetsBaseUrl}/s5.jpg`, alt: 'Business class view 5' }
  ];

export const GalleryPanel: React.FC = () => {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  return (
    <div style={{ marginTop: '1rem' }}>
      <strong>Aircraft gallery:</strong>
      <div className="gallery-grid">
        {images.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt}
            onClick={() => setSelectedImage(img.src)}
            className="thumbnail"
          />
        ))}
      </div>

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Large view" className="lightbox-img" />
        </div>
      )}
    </div>
  );
};