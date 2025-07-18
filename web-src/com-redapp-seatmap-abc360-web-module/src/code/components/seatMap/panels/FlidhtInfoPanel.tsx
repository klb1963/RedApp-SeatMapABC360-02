// file: components/seatMap/panels/FlightInfoPanel.tsx

import * as React from 'react';
import { t } from '../../../Context';
import cityByIata from '../../../assets/iata-city-mapping';


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
  let localizedDate = t('seatMap.dateUnknown');
  try {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      localizedDate = new Intl.DateTimeFormat(navigator.language || 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(d);
    }
  } catch (e) {
    console.warn('⚠️ Invalid date in FlightInfoPanel:', date);
  }

  const validPrices = availability?.map(a => a.price).filter(p => p > 0) || [];

  const minPrice = validPrices.length ? Math.min(...validPrices) : null;
  const maxPrice = validPrices.length ? Math.max(...validPrices) : null;
  const currency = availability?.[0]?.currency || '';
  const cleanDuration = String(duration || '').trim();

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
          {cleanDuration !== '' && (
            <div><strong>Duration:</strong> {cleanDuration}</div>
          )}
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