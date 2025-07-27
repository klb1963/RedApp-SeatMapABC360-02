// file: code/components/seatMap/layout/SeatMapModalLayout.tsx

/**
 * SeatMapModalLayout
 * 
 * Layout component used for the full-size Seat Map modal (for Quicket iframe view).
 * 
 * Divides the modal into three vertical sections:
 * - Left: flight information panel + optional aircraft gallery
 * - Center: embedded seat map (iframe)
 * - Right: passenger panel and seat legend
 */

import * as React from 'react';

interface SeatMapModalLayoutProps {
  flightInfo: React.ReactNode;
  galleryPanel?: React.ReactNode;
  passengerPanel: React.ReactNode;
  legendPanel?: React.ReactNode;
  children: React.ReactNode; // Seat map iframe
  hasPassengers?: boolean;   // If false, hides passengerPanel and adjusts layout
}

export const SeatMapModalLayout: React.FC<SeatMapModalLayoutProps> = ({
  flightInfo,
  galleryPanel,
  passengerPanel,
  legendPanel,
  children, 
  hasPassengers,
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
      {/* 🧭 Left column — flight info + aircraft gallery */}
      <div style={{
        flexBasis: '40%',
        flexShrink: 0,
        background: '#f8f8f8',
        padding: '1rem',
        borderRight: '1px solid #ddd',
        overflowY: 'auto'
      }}>
        {flightInfo}
        {galleryPanel}
      </div>

      {/* 🗺️ Center column — Quicket iframe seat map */}
      <div style={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        minHeight: '100%',
        border: '1px solid #ccc'    
      }}>
        {children}
      </div>

      {/* 👤 Right column — passenger panel + legend (only if hasPassengers=true) */}
      <div style={{
        flexBasis: '25%',
        marginLeft: '3rem',
        flexShrink: 0,
        background: '#f8f8f8',
        padding: '1rem',
        borderLeft: '1px solid #ddd',
        overflowY: 'auto'
      }}>
        {hasPassengers && passengerPanel}

        {legendPanel && (
          <div style={{ marginTop: hasPassengers ? '2rem' : '-2rem' }}>
            {hasPassengers && (
              <hr style={{
                marginBottom: '1rem',
                border: 0,
                borderTop: '1px solid #ccc',
                width: '100%',
              }} />
            )}
            <div>{legendPanel}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMapModalLayout;