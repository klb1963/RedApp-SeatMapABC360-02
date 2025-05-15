// file: /code/components/seatMap/tiles/SeatMapAvailView.ts

/**
 * SeatMapAvailView.ts
 * 
 * 🧭 Placeholder View for SeatMap in Availability Scenario – RedApp ABC360
 * 
 * This React component is intended to display the seat map view when integrated into
 * the Air Availability workflow. Currently, it's a placeholder confirming that the
 * SeatMap module was loaded. Full integration (with a visual map) is pending.
 */

import * as React from 'react';
import { PublicAirAvailabilityData } from 'sabre-ngv-airAvailability/services/PublicAirAvailabilityData';

export const SeatMapAvailView: React.FC<PublicAirAvailabilityData> = (props) => {
  // Future: props will contain availability, segment, etc.
  // console.log('SeatMapAvailView props:', props);

  return (
    <div className="sdk-seatmap-custom-tile-content">
      {/* ✅ Confirm that the SeatMap module has rendered */}
      <p>SeatMap Viewer loaded</p>
    </div>
  );
};