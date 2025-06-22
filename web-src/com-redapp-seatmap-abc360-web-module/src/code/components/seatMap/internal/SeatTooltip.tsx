// file: /code/components/seatMap/internal/SeatTooltip.tsx

import * as React from 'react';

interface SeatTooltipProps {
  codes: string[];
}

const codeMap: Record<string, string> = {
  B: 'Bulkhead row',
  G: 'Near galley',
  L: 'Near lavatory',
  R: 'Limited recline',
  Y: 'Power outlet',
  Z: 'Extra legroom',
  D: 'Bassinet seat',
};

const SeatTooltip: React.FC<SeatTooltipProps> = ({ codes }) => {
  if (!codes.length) return null;

  const filtered = codes.filter(code => codeMap[code]);

  if (!filtered.length) return null;

  console.log('[TOOLTIP] seat codes:', codes)

  return (
    <div
      style={{
        position: 'absolute',
        top: '-6rem',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#333',
        color: '#fff',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        fontSize: '0.9rem',
        whiteSpace: 'normal',
        maxWidth: '200px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        zIndex: 1000,
      }}
    >
      <ul style={{ listStyle: 'disc', margin: 0, paddingLeft: '1.2rem' }}>
        {filtered.map(code => (
          <li key={code}>{codeMap[code]}</li>
        ))}
      </ul>
    </div>
  );
}

export default SeatTooltip;