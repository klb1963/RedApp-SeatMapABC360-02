// file: /code/components/seatMap/internal/SeatItemSvg.tsx

import * as React from 'react';

interface SeatItemSvgProps {
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
  label?: string;
}

const SeatItemSvg: React.FC<SeatItemSvgProps> = ({
  color,
  strokeColor = '#333',
  strokeWidth = 1,
  onClick,
  style = {},
  label,
}) => {
  return (
    <svg
      version="1.1"
      baseProfile="full"
      width="40"
      height="72"
      viewBox="0 0 122 220"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: 'pointer', ...style }}
    >
      <g transform="scale(1.2)">
        <rect
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          x="9.93"
          y="71.69"
          width="81.91"
          height="60.75"
          rx="7.59"
          ry="7.59"
        />
        <path
          stroke={strokeColor}
          fill="#999"
          strokeWidth={strokeWidth}
          d="M9,142.15H3.08A3.09,3.09,0,0,1,0,139.07V84.52a3.09,3.09,0,0,1,3.08-3.08H9a3.09,3.09,0,0,1,3.08,3.08v54.55A3.09,3.09,0,0,1,9,142.15Zm91-3.08V84.52a3.09,3.09,0,0,0-3.08-3.08H91.29a3.09,3.09,0,0,0-3.08,3.08v54.55a3.09,3.09,0,0,0,3.08,3.08h5.63A3.09,3.09,0,0,0,100,139.07Z"
        />
        <path
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill={color}
          d="M84.71,145.5H14.9c-2.74,0-5-2.8-5-6.23V132c0-3.44,2.23-6.23,5-6.23l.19,0a195.67,195.67,0,0,0,34.71,3,210.38,210.38,0,0,0,34.72-3l.18,0c2.74,0,5,2.8,5,6.23v7.25C89.67,142.7,87.44,145.5,84.71,145.5Z"
        />

        <path
        fill="white"
        stroke="white"
        d="M67,140h-35c-1.5,0-2.95-1.3-2.95-2.9v-3.5c0-.2,0-.4.08-.6L32,128a3,3,0,0,1,2.87-2.2H64.3a3,3,0,0,1,2.85,2.2l3,8.2c.05.14.1.4.1.7v3.5A2.94,2.94,0,0,1,67,140Z"
        />

        {/* 🆕 Текст на кресле */}
        {label && (
          <text
            x="43%"
            y="110"
            textAnchor="middle"
            fill="#ffffff" // #ffffff #000000
            fontSize="24"
            fontWeight="bold"
            pointerEvents="none"
          >
            {label}
          </text>
        )}
      </g>
    </svg>
  );
};

export default SeatItemSvg;