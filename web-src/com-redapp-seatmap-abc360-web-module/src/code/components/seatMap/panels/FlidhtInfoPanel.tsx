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
  equipmentType: string;
  aircraft: string;
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
  equipmentType,
  aircraft
}) => {
  return (
    <div style={{
      backgroundColor: '#f8f8f8',
      padding: '1rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '1rem'
    }}>
      <div style={{ fontSize: '1.5rem' }}>
        Flight: {airlineName}&nbsp;{flightNumber}
      </div>
      <div style={{ margin: '0.5rem 0' }}>
        Rout: {fromCode} {fromCity} → {toCode} {toCity}
      </div>
      <div>Date: {date}</div>
      <div>Duration: {duration || '—'}</div>
      <div>Equipment type: {equipmentType}</div>
      <div>Aircraft: {aircraft}</div>
    </div>
  );
};