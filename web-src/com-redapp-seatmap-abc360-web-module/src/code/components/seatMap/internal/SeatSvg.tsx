// ✅ file: /code/components/seatMap/internal/SeatSvg.tsx

import * as React from 'react';

interface SeatSvgProps {
  color: string;
  label?: string;
  isSelected?: boolean;
}

const SeatSvg: React.FC<SeatSvgProps> = ({ color, label = '', isSelected = false }) => {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24">
      <rect
        x="2"
        y="4"
        rx="4"
        ry="4"
        width="20"
        height="16"
        fill={color}
        stroke={isSelected ? '#000' : '#666'}
        strokeWidth="1"
      />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#fff"
      >
        {label}
      </text>
    </svg>
  );
};

export default SeatSvg;