//file: /code/components/seatMap/tiles/SeatMapPricingTile.tsx

/**
 * SeatMapPricingTile.tsx
 * 
 * 💰 Tile Component for the Pricing Panel – RedApp ABC360
 * 
 * Displays a button for opening the SeatMap modal in the pricing workflow.
 * Uses data previously stored in `sessionStorage` to display a label describing flight segments.
 * The actual action on button click (e.g. showReactModal) should be implemented externally.
 */

import * as React from 'react';
import { AirPricingData } from 'sabre-ngv-pricing/response/interfaces/AirPricingData';

export const PricingTile = (data: AirPricingData): React.ReactElement => {

  // 📦 Construct a flight segment label from sessionStorage
  let segmentLabel = '';
  try {
    // Retrieve serialized flight segment data from session storage
    const raw = window.sessionStorage.getItem('flightSegmentsForPricing');
    const segments = raw ? JSON.parse(raw) : [];

    // Create a human-readable string from segments (e.g., MUC-FRA:LH 1234)
    segmentLabel = segments.map((segment: any) => {
      return `${segment.origin}-${segment.destination}:${segment.marketingAirline} ${segment.flightNumber}`;
    }).join(' ');
  } catch (e) {
    console.error('⚠️ Error while parsing flightSegmentsForPricing in PricingTile:', e);
    segmentLabel = 'ABC Seat Map';
  }

  return (
    <div
      className="sdk-pricing-custom-tile-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px'
      }}
    >
      {/* 🏷️ Flight info label */}
      <div style={{ fontSize: '12px', marginBottom: '8px', textAlign: 'center' }}>
        {segmentLabel}
      </div>

      {/* 🎯 Button to trigger SeatMap */}
      <button
        className="abc-seatmap-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 12px',
          backgroundColor: '#2f73bc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        SeatMaps ABC 360
      </button>
    </div>
  );
};