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
  passengerPanel: React.ReactNode;
  children: React.ReactNode; // iframe
}

const SeatMapModalLayout: React.FC<SeatMapModalLayoutProps> = ({
  flightInfo,
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
      {/* Левая колонка — информация о рейсе */}
      <div style={{
        width: '25%',
        minWidth: '180px',
        background: '#f8f8f8',
        padding: '1rem',
        borderRight: '1px solid #ddd',
        overflowY: 'auto'
      }}>
        {flightInfo}
      </div>

      {/* Центр — iframe с картой салона */}
      <div style={{
        flexGrow: 1,
        border: '1px solid #ccc',
        overflow: 'hidden'
      }}>
        {children}
      </div>

      {/* Правая колонка — панель пассажиров и подтверждение */}
      <div style={{
        width: '25%',
        minWidth: '220px',
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