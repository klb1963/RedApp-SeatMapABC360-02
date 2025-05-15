// file: code/components/seatMap/panels/SeatLegend.tsx

/**
 * SeatLegend.tsx
 * 
 * 🎨 SeatMap Legend Component – RedApp ABC360
 * 
 * A simple visual guide explaining the meaning of seat colors and icons
 * used in the SeatMap UI:
 * - Available
 * - Available for a fee
 * - Unavailable
 * - Occupied
 * 
 * Displayed alongside the seat map to help agents interpret seating options.
 */

import * as React from 'react';

const SeatLegend: React.FC = () => (
  <div style={{ marginBottom: '1rem' }}>
    <strong>Legend:</strong>
    <ul style={{ paddingLeft: '1rem', lineHeight: '1.8' }}>
      <li>🟩 — available</li>
      <li>🟧 — available for a fee</li>
      <li>❌ — unavailable</li>
      <li>☑️ — occupied</li>
    </ul>
  </div>
);

export default SeatLegend;