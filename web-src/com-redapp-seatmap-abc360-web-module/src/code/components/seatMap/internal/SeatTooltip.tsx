// ✅ file: /code/components/seatMap/internal/SeatTooltip.tsx

import * as React from 'react';

interface SeatTooltipProps {
  seatInfo: {
    rowNumber: string;
    column: string;
    cabinClass: string;
    price?: string;
    characteristicsText?: string; // Многострочный текст с флагами, если есть
  };
  position?: 'top' | 'bottom';
}

const SeatTooltip: React.FC<SeatTooltipProps> = ({ seatInfo, position = 'top' }) => {
  if (!seatInfo) return null;

  const tooltipTop = position === 'bottom' ? '4.5rem' : '-8rem';

  return (
    <div
      style={{
        position: 'absolute',
        top: tooltipTop,
        left: '-3rem',
        backgroundColor: '#333',
        color: '#fff',
        padding: '0.8rem 1rem',
        borderRadius: '0.6rem',
        whiteSpace: 'pre-line',
        fontSize: '1.5rem',
        minWidth: '18rem',
        maxWidth: '24rem',
        lineHeight: 1.6,
        boxShadow: '0px 0px 6px rgba(0,0,0,0.3)',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
        {seatInfo.rowNumber}{seatInfo.column} {seatInfo.cabinClass}
      </div>
      {seatInfo.price && (
        <div style={{ marginBottom: '0.5rem' }}>{seatInfo.price}</div>
      )}
      {seatInfo.characteristicsText && (
        <div>{seatInfo.characteristicsText}</div>
      )}
    </div>
  );
};

export default SeatTooltip;