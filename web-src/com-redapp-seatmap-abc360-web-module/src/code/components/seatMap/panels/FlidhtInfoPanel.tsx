// file: components/seatMap/panels/FlightInfoPanel.tsx

import * as React from 'react';

interface FlightInfoPanelProps {
  airlineCode: string; 
  airlineName: string;
  flightNumber: string;
  fromCode: string;
  fromCity?: string;
  toCode: string;
  toCity?: string;
  date: string;
  duration: string;
  aircraft: string;
  seatPrice?: string;
  availability?: {
    price: number;
    currency: string;
  }[];
}

const cityByIata: Record<string, string> = {
  "MUC": "Munich",
  "DXB": "Dubai",
  "FRA": "Frankfurt",
  "JFK": "New York",
  "BER": "Berlin",
  "LHR": "London",
  "CDG": "Paris",
  "AMS": "Amsterdam",
  "MAD": "Madrid",
  "VIE": "Vienna",
  "ZRH": "Zurich",
  "IST": "Istanbul",
  "SIN": "Singapore",
  "BKK": "Bangkok",
  "HND": "Tokyo Haneda",
  "NRT": "Tokyo Narita",
  "LAX": "Los Angeles",
  "SFO": "San Francisco",
  "ORD": "Chicago O'Hare",
  "ATL": "Atlanta",
  "DEL": "Delhi",
  "BOM": "Mumbai"
  // TODO - expand list with more values
};

export const FlightInfoPanel: React.FC<FlightInfoPanelProps> = ({
  airlineCode,
  airlineName,
  flightNumber,
  fromCode,
  fromCity,
  toCode,
  toCity,
  date,
  duration,
  aircraft,
  seatPrice,
  availability
}) => {
  const cityFrom = fromCity || cityByIata[fromCode] || '';
  const cityTo = toCity || cityByIata[toCode] || '';

  // Локализованная дата
  const localizedDate = new Intl.DateTimeFormat(navigator.language || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));

  const validPrices = availability?.map(a => a.price).filter(p => p > 0) || [];

  const minPrice = validPrices.length ? Math.min(...validPrices) : null;
  const maxPrice = validPrices.length ? Math.max(...validPrices) : null;
  const currency = availability?.[0]?.currency || '';

  return (
    <div style={{
      backgroundColor: '#f8f8f8',
      padding: '1rem',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '1rem',
      lineHeight: '2.5rem' 
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        fontSize: '1.5rem',
        color: '#333'
      }}>
        {/* Левая колонка */}
        <div style={{ flex: '1 1 45%' }}>
          <div style={{ fontSize: '1.5rem' }}> {airlineName} {airlineCode} {flightNumber}</div>
          <div><strong>Date:</strong> {localizedDate}</div>
          <div><strong>Aircraft:</strong> {aircraft}</div>
        </div>

        {/* Правая колонка */}
        <div style={{ flex: '1 1 45%' }}>
          <div style={{ fontSize: '1.5rem' }}>{fromCode} - {cityFrom} → {toCode} - {cityTo}</div>
          <div><strong>Duration:</strong> {duration}</div>
        </div>
      </div>
      {minPrice !== null && maxPrice !== null && (
        <div style={{ marginTop: '0.5rem', fontWeight: 500 }}>
          Price per Seat: {currency} {minPrice.toFixed(2)}–{maxPrice.toFixed(2)}
        </div>
      )}
    </div>
  );
};