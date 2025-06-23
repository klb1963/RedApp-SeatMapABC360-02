// ✅ file: /code/components/seatMap/internal/SeatTooltip.tsx

import * as React from 'react';

interface SeatTooltipProps {
    text: string;
    position?: 'top' | 'bottom';
  }

  const SeatTooltip: React.FC<SeatTooltipProps> = ({ text, position = 'top' }) => {
    if (!text) return null;
  
    const tooltipTop = position === 'bottom' ? '4.5rem' : '-8rem';

  return (

      <div
          style={{
              position: 'absolute',
              top: tooltipTop,                // подняли выше
              left: '-3rem',               // сдвинули чуть левее
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
              pointerEvents: 'none',      // 💡 отключаем реакцию мыши
          }}
      >
          {text}
      </div>

  );
};

export default SeatTooltip;