import * as React from 'react';

interface PremiumSeatSvgProps {
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
  label?: string;
}

const PremiumSeatSvg: React.FC<PremiumSeatSvgProps> = ({
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
      width="48"
      height="96"
      viewBox="0 0 60 80"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: 'pointer', ...style }}
    >
      {/* 👇 добавлено смещение вправо на 3px */}
      <g transform="translate(3, 0)">
        <rect fill={strokeColor} y="4.3" width="5.36" height="32.29" rx="1.97" ry="1.97" />
        <rect fill={strokeColor} x="49.02" y="4.3" width="5.36" height="32.29" rx="1.97" ry="1.97" />

        <path
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M44.94,1.07C40.15.71,33.1,0,26.87,0,21.37,0,13.66.47,9.35.93A4.41,4.41,0,0,0,5.41,5.31V33H49V5.47A4.41,4.41,0,0,0,44.94,1.07Z"
        />

        <path
          fill={color}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          d="M47.56,37.58h-40a2.85,2.85,0,0,1-2.85-2.85V31.43a2.85,2.85,0,0,1,2.85-2.85h.11A139.86,139.86,0,0,0,27.56,30a150.41,150.41,0,0,0,19.9-1.38h.1a2.85,2.85,0,0,1,2.85,2.85v3.31A2.85,2.85,0,0,1,47.56,37.58Z"
        />

        <rect fill="white" x="19.25" y="28.88" width="15.92" height="5.47" rx="2.02" ry="2.02" />

        {label && (
          <text
            x="45%"
            y="20"
            textAnchor="middle"
            fill="#fff"
            fontSize="12"
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

export default PremiumSeatSvg;