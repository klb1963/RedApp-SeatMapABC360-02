// file: SeatMapComponentPricing.tsx

import * as React from 'react';
import { useState } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import SeatLegend from './panels/SeatLegend';

interface SeatMapComponentPricingProps {
  config: any;
  flightSegments: any[];
  selectedSegmentIndex: number;
}

const SeatMapComponentPricing: React.FC<SeatMapComponentPricingProps> = ({
  config,
  flightSegments,
  selectedSegmentIndex
}) => {
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');

  const segment = flightSegments[selectedSegmentIndex];
  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'неизвестно';

  const departureDate = segment?.departureDate?.toISOString().split('T')[0] || 'not specified';

  // 🧩 Комбинируем Flight Info + Legend
  const flightInfo = segment && (
    <div>
      <strong>Flight info:</strong>
      <div>{segment.origin} → {segment.destination}</div>
      <div>Date: {departureDate}</div>
      <div>Equipment: {equipment}</div>
      <div>Class: {cabinClass}</div>
      <div style={{ marginTop: '1rem' }}>
        <SeatLegend />
      </div>
    </div>
  );

  return (
    <div style={{ padding: '1rem' }}>
      {/* 🔝 Сегмент и Самолёт */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <label style={{ marginRight: '0.5rem' }}>Сегмент:</label>
          <span>
            {segment?.origin} → {segment?.destination}, рейс {segment?.flightNumber}
          </span>
        </div>
        <div style={{ fontSize: '1.5rem', color: '#555' }}>
          ✈️ <strong>Самолёт:</strong> {equipment}
        </div>
      </div>

      {/* 👔 Класс обслуживания */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Класс обслуживания:</label>
        <select
          value={cabinClass}
          onChange={(e) => setCabinClass(e.target.value as 'Y' | 'S' | 'C' | 'F' | 'A')}
        >
          <option value="Y">Economy</option>
          <option value="S">Premium Economy</option>
          <option value="C">Business</option>
          <option value="F">First</option>
          <option value="A">All Cabins</option>
        </select>
      </div>

      {/* 📌 Вставляем компонент карты */}
      <SeatMapComponentBase
        config={config}
        flightSegments={flightSegments}
        initialSegmentIndex={selectedSegmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(
            { ...segment, cabinClass: cabin, equipment: segment.equipment },
            index
          )
        }
        availability={[]}
        passengers={[]}
        showSegmentSelector={false}
        flightInfo={flightInfo} // ✅ добавлено
      />
    </div>
  );
};

export default SeatMapComponentPricing;