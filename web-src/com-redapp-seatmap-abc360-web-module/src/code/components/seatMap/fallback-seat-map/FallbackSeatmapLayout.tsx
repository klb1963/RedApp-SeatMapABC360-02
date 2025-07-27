// file: /code/components/seatMap/fallback-seat-map/FallbackSeatmapLayout.tsx

import * as React from 'react';

interface Props {
  flightInfo: React.ReactNode;       // Left panel — flight information
  center: React.ReactNode;           // Center panel — seatmap visualization
  passengerPanel: React.ReactNode;   // Right panel — passenger list and seat selections
  legendPanel: React.ReactNode;      // Right panel — seat legend
}

/**
 * FallbackSeatmapLayout
 *
 * A responsive 3-column layout for the fallback seat map.
 * Divides the screen into:
 * - Left column: flight info
 * - Center: seat map rendering
 * - Right column: passenger panel and seat legend
 */

export const FallbackSeatmapLayout: React.FC<Props> = ({
  flightInfo,
  center,
  passengerPanel,
  legendPanel
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '90vh',
        width: '100%',
        boxSizing: 'border-box',
        padding: '1rem',
        gap: '1rem'
      }}
    >
      {/* Left column — flight info */}
      <div
        style={{
          flexBasis: '37%',
          flexShrink: 0,
          background: '#f8f8f8',
          padding: '1rem',
          borderRight: '1px solid #ddd',
          overflowY: 'auto'
        }}
      >
        {flightInfo}
      </div>

      {/* Center column — seat map */}
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflow: 'auto',
          minHeight: '100%',
          border: '1px solid #ccc'
        }}
      >
        {center}
      </div>

      {/* Right column — passenger panel and legend */}
      <div
        style={{
          flexBasis: '25%',
          flexShrink: 0,
          background: '#f8f8f8',
          padding: '1rem',
          borderLeft: '1px solid #ddd',
          overflowY: 'auto'
        }}
      >
        {passengerPanel}

        <div style={{ marginTop: '2rem' }}>
          <hr
            style={{
              marginBottom: '1rem',
              border: 0,
              borderTop: '1px solid #ccc',
              width: '100%'
            }}
          />
          {legendPanel}
        </div>
      </div>
    </div>
  );
};

export default FallbackSeatmapLayout;