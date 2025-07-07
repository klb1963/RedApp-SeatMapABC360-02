// file: /code/components/seatMap/internal/FallbackSeatmapLayout.tsx

import * as React from 'react';

interface Props {
  flightInfo: React.ReactNode;
  center: React.ReactNode;
  passengerPanel: React.ReactNode;
  legendPanel: React.ReactNode;
}

const FallbackSeatmapLayout: React.FC<Props> = ({
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
      {/* Left — flight info */}
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

      {/* Center — seatmap */}
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

      {/* Right — passenger panel + legend */}
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