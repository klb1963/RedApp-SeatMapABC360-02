// file: components/seatMap/panels/FlightInfoPanel.tsx

/**
 * FlightInfoPanel
 * 
 * Displays flight summary information:
 * - Airline, flight number, aircraft
 * - Departure/arrival airports and cities
 * - Flight date and duration
 * - Optional seat price range
 */

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

  // 🗓️ Format the flight date using user's locale or fallback to "not specified"
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
        {/* ✈️ Airline info (left column) */}
        <div style={{ flex: '1 1 45%' }}>
          <div style={{ fontSize: '1.5rem' }}> {airlineName} {airlineCode} {flightNumber}</div>
          <div><strong>{t('seatMap.date')}:</strong> {localizedDate}</div>
          <div><strong>{t('seatMap.aircraft')}:</strong> {aircraft}</div>
        </div>

        {/* 🌍 Route info (right column) */}
        <div style={{ flex: '1 1 45%' }}>
          <div style={{ fontSize: '1.5rem' }}>{fromCode} - {cityFrom} → {toCode} - {cityTo}</div>
          {cleanDuration !== '' && (
            <div><strong>{t('seatMap.duration') || 'Duration'}:</strong> {cleanDuration}</div>
          )}
        </div>
      </div>

      {/* 💺 Seat price range */}
      {minPrice !== null && maxPrice !== null && (
        <div style={{ marginTop: '0.5rem', fontWeight: 500 }}>
          {t('seatMap.priceRange') || 'Price per Seat'}: {currency} {minPrice.toFixed(2)}–{maxPrice.toFixed(2)}
        </div>
      )}
    </div>
  );
};