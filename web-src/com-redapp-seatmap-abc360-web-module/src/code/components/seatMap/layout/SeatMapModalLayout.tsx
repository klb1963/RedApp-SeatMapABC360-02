// file: code/components/seatMap/layout/SeatMapModalLayout.tsx

/**
 * SeatMapModalLayout
 * 
 * Layout component used for the Seat Map modal.
 * Divides the modal into three columns:
 * - Left: flight info
 * - Center: seat map iframe
 * - Right: passenger panel
 */

import * as React from 'react';

interface SeatMapModalLayoutProps {
  flightInfo: React.ReactNode;
  galleryPanel?: React.ReactNode; 
  passengerPanel: React.ReactNode;
  children: React.ReactNode; // iframe
}

const SeatMapModalLayout: React.FC<SeatMapModalLayoutProps> = ({
  flightInfo,
  galleryPanel,
  passengerPanel,
  children
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '90vh',
      width: '100%',
      boxSizing: 'border-box',
      padding: '1rem',
      gap: '1rem'
    }}>
      {/* Left side — flight info */}
      <div style={{
        width: '40%',
        minWidth: '250px',
        background: '#f8f8f8',
        padding: '1rem',
        borderRight: '1px solid #ddd',
        overflowY: 'auto'
      }}>
        {flightInfo}  {/* 📋 flight info */}
        {galleryPanel} {/* 🖼️ aircraft galery */}
      </div>
      {/* Center — iframe with seat map */}
      <div
        style={{
          flexGrow: 1,
          display: 'flex',               // 💡 flex-контейнер
          justifyContent: 'center',      // 👉 горизонтальное центрирование
          alignItems: 'center',          // 👉 вертикальное центрирование
          border: '1px solid #ccc',
          overflow: 'hidden',
          minHeight: '100%',             // 💡 растягиваем по высоте
        }}
      >
        {children}
      </div>

      {/* Right side — passengers panel */}
      <div style={{
        width: '30%',
        minWidth: '250px',
        background: '#f8f8f8',
        padding: '1rem',
        borderLeft: '1px solid #ddd',
        overflowY: 'auto'
      }}>
        {passengerPanel}
      </div>
    </div>
  );
};

export default SeatMapModalLayout;