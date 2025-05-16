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
import { t } from '../../../Context'; // i18n

const SeatLegend: React.FC = () => (
  <div style={{ marginBottom: '1rem' }}>
    <strong>{t('seatMap.legendTitle')}:</strong> {/* i18n */}
    <ul style={{ paddingLeft: '1rem', lineHeight: '1.8' }}>
      <li>🟩 — {t('seatMap.legend.available')}</li> {/* i18n */}
      <li>🟧 — {t('seatMap.legend.availableFee')}</li> {/* i18n */}
      <li>⬜️ — {t('seatMap.legend.occupied')}</li> {/* i18n */}
      <li>🛑 — {t('seatMap.legend.unavailable')}</li> {/* i18n */}
      <li>🚼 — {t('seatMap.legend.stroller')}</li> {/* i18n */}
      <li>🚻 — {t('seatMap.legend.lavatory')}</li> {/* i18n */}
      <li>🍴 — {t('seatMap.legend.galley')}</li> {/* i18n */}
    </ul>
  </div>
);

export default SeatLegend;