// file: components/seatMap/panels/FlightInfoPanel.tsx

import * as React from 'react';

interface FlightInfoPanelProps {
  airlineName: string;
  flightNumber: string;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  date: string;
  duration: string;
  equipment: string;
}

export const FlightInfoPanel: React.FC<FlightInfoPanelProps> = ({
  airlineName,
  flightNumber,
  fromCode,
  fromCity,
  toCode,
  toCity,
  date,
  duration,
  equipment
}) => {
  return (
    <div style={{
      backgroundColor: '#f8f8f8',
      padding: '1rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '1rem'
    }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {airlineName}&nbsp;{flightNumber}
        </div>
      <div style={{ margin: '0.5rem 0' }}>
        {fromCode} {fromCity} → {toCode} {toCity}
      </div>
      <div>Date: {date}</div>
      <div>Duration: {duration || '—'}</div>
      <div>Equipment type: {equipment}</div>
    </div>
  );
};