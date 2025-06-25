// file: components/seatMap/internal/SeatGraphic.tsx

import * as React from 'react';

interface SeatGraphicProps {
  label: string;
  color: string;
  selected?: boolean;
}

const SeatGraphic: React.FC<SeatGraphicProps> = ({ label, color, selected = false }) => {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      {/* Спинка */}
      <rect x="10" y="5" width="44" height="18" rx="3" ry="3" fill="#444" />
      
      {/* Подушка (меняем цвет по переданному `color`) */}
      <rect x="10" y="25" width="44" height="22" rx="5" ry="5" fill={color} stroke="#222" strokeWidth="2" />

      {/* Подлокотники */}
      <rect x="5" y="25" width="4" height="22" fill="#888" />
      <rect x="55" y="25" width="4" height="22" fill="#888" />

      {/* Акцент при выборе */}
      {selected && (
        <circle cx="58" cy="10" r="5" fill="orange" />
      )}

      {/* Надпись */}
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontSize="14"
        fontWeight="bold"
        fill="#fff"
      >
        {label}
      </text>
    </svg>
  );
};

export default SeatGraphic;