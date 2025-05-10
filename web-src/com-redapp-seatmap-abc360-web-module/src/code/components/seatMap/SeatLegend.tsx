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