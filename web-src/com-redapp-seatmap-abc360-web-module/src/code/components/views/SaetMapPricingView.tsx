// file: /code/components/seatMap/tiles/SeatMapPricingView.tsx

/**
 * SeatMapPricingView.tsx
 * 
 * 💺 Modal View for SeatMap in Pricing Scenario – RedApp ABC360
 * 
 * This component is used to render the pricing-related SeatMap view (typically inside a modal).
 * It reads preselected flight segment data from sessionStorage and renders the SeatMapComponentPricing.
 * If no data is found, it shows an error message.
 */

import * as React from 'react';
import SeatMapComponentPricing from '../seatMap/SeatMapComponentPricing';
import { quicketConfig } from '../../utils/quicketConfig';

export const PricingView = (): React.ReactElement => {
  // 📦 Attempt to retrieve stored flight segments from sessionStorage
  const raw = window.sessionStorage.getItem('flightSegmentsForPricing');
  let segments: any[] = [];

  try {
    // Try to parse the segments from storage (used by PricingTile)
    segments = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('❌ Failed to parse flightSegmentsForPricing:', e);
  }

  // ❗ Show fallback message if no segments are available
  if (!segments.length) {
    return (
      <div style={{ padding: '1rem' }}>
        ❗ No available flight segments to display Seat Map.
      </div>
    );
  }

  // ✅ Render SeatMapComponentPricing with the first segment
  return (
    <SeatMapComponentPricing
      config={quicketConfig}
      flightSegments={segments}
      selectedSegmentIndex={0}
    />
  );
};