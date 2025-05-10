import * as React from 'react';
import SeatMapComponentPricing from '../seatMap/SeatMapComponentPricing';
import { quicketConfig } from '../../utils/quicketConfig';

export const PricingView = (): React.ReactElement => {
  const raw = window.sessionStorage.getItem('flightSegmentsForPricing');
  let segments: any[] = [];

  try {
    segments = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('❌ Ошибка чтения flightSegmentsForPricing:', e);
  }

  if (!segments.length) {
    return (
      <div style={{ padding: '1rem' }}>
        ❗ Нет доступных сегментов рейса для отображения карты мест.
      </div>
    );
  }

  return (
    <SeatMapComponentPricing
      config={quicketConfig}
      flightSegments={segments}
      selectedSegmentIndex={0}
    />
  );
};