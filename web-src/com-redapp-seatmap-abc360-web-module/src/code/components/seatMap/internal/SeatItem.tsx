// ✅ file: /code/components/seatMap/internal/SeatItem.tsx

import * as React from 'react';

interface SeatItemProps {
  label: string;
  color: string;
  disabled?: boolean;
  onClick?: () => void;
}

const SeatItem: React.FC<SeatItemProps> = ({ label, color, disabled = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '4rem',
        height: '4rem',
        backgroundColor: color,
        border: 'none',
        borderRadius: '0.75rem 0.75rem 0 0',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.3rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }}
    >
      {label}
    </button>
  );
};

export default SeatItem;