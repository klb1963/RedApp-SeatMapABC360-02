// file: src/code/components/seatMap/SeatLegend.tsx

import React from 'react';

const legendItems = [
  { icon: 'assets/icons/seat-free.svg', label: 'свободно' },
  { icon: 'assets/icons/seat-occupied.svg', label: 'занято' },
  { icon: 'assets/icons/seat-unavailable.svg', label: 'недоступно' },
  { icon: 'assets/icons/seat-selected.svg', label: 'выбрано' },
];

const SeatLegend: React.FC = () => (
  <div>
    <div><strong>Обозначения:</strong></div>
    <ul style={{ paddingLeft: '1rem', listStyle: 'none', margin: 0 }}>
      {legendItems.map((item, idx) => (
        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <img src={item.icon} alt={item.label} style={{ width: 20, height: 20 }} />
          — {item.label}
        </li>
      ))}
    </ul>
  </div>
);

export default SeatLegend;