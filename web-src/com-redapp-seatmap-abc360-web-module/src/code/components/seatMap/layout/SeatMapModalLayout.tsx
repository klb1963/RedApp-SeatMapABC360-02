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
import { SeatLegend } from '../panels/SeatLegend';
import { isFallbackMode } from '../utils/isFallbackMode';

interface SeatMapModalLayoutProps {
  flightInfo: React.ReactNode;
  galleryPanel?: React.ReactNode;
  passengerPanel: React.ReactNode;
  legendPanel?: React.ReactNode;
  children: React.ReactNode; // iframe
}

const SeatMapModalLayout: React.FC<SeatMapModalLayoutProps> = ({
  flightInfo,
  galleryPanel,
  passengerPanel,
  legendPanel,
  children
}) => {

  const fallback = isFallbackMode();

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
        flexBasis: '35%',
        flexShrink: 0,
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          minHeight: '100%',
          border: '1px solid #ccc'    
        }}
      >
        {children}
      </div>

      {/* Right side — passengers panel */}
      {!fallback && (
        <div style={{
          flexBasis: '25%',       // 👈 минимально допустимая ширина
          marginLeft: '3rem',       // 👈 Сдвигаем вправо
          flexShrink: 0,
          background: '#f8f8f8',
          padding: '1rem',
          borderLeft: '1px solid #ddd',
          overflowY: 'auto'
        }}>
          {passengerPanel}

          {legendPanel && (
            <div style={{ marginTop: '2rem' }}>
              <hr style={{
                marginBottom: '1rem',
                border: 0,
                borderTop: '1px solid #ccc',
                width: '100%',
              }} />
              <div>{legendPanel}</div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default SeatMapModalLayout;