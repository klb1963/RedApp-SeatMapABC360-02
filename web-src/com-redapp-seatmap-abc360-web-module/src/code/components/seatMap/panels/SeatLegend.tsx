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

// file: SeatLegend.tsx
import * as React from 'react';
import { t } from '../../../Context'; // i18n

const SeatLegend: React.FC = () => (
  <div style={{ marginBottom: '1rem' }}>
    <strong>{t('seatMap.legendTitle')}:</strong>
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        paddingLeft: '1rem',
        lineHeight: '1.8',
        columnGap: '1.5rem',
        marginTop: '0.5rem'
      }}
    >
      <li>🟩 — {t('seatMap.legend.available')}</li>
      <li>🟧 — {t('seatMap.legend.availableFee')}</li>
      <li>⬜️ — {t('seatMap.legend.occupied')}</li>
      <li>🛑 — {t('seatMap.legend.unavailable')}</li>
      <li>🚼 — {t('seatMap.legend.stroller')}</li>
      <li>🚻 — {t('seatMap.legend.lavatory')}</li>
      <li>🍴 — {t('seatMap.legend.galley')}</li>
    </ul>
  </div>
);

export default SeatLegend;