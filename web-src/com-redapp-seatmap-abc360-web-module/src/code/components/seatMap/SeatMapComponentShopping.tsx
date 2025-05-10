// file: SeatMapComponentShopping.tsx

import * as React from 'react';
import { useState } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import SeatLegend from './SeatLegend';

interface SeatMapComponentShoppingProps {
  config: any;
  data: any;
}

const SeatMapComponentShopping: React.FC<SeatMapComponentShoppingProps> = ({ config, data }) => {
  const flightSegments = Array.isArray(data?.flightSegments) ? data.flightSegments : [];

  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>('Y');
  const [segmentIndex, setSegmentIndex] = useState(0);

  const currentSegment = flightSegments[segmentIndex] || {};

  // Прямая проверка типа оборудования (если есть вложенный EncodeDecodeElement)
  const equipment =
    typeof currentSegment.equipment === 'object'
      ? currentSegment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : currentSegment.equipment || 'неизвестно';

  return (
    <div style={{ padding: '1rem' }}>
      {/* 🔁 Селектор сегмента и отображение типа самолёта */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <label style={{ marginRight: '0.5rem' }}>Сегмент:</label>
          <select
            value={segmentIndex}
            onChange={(e) => setSegmentIndex(Number(e.target.value))}
          >
            {flightSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin || '???'} → {seg.destination || '???'}, рейс {seg.flightNumber || '---'}
              </option>
            ))}
          </select>
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

      {/* 🧩 Отображение карты мест */}
      <SeatMapComponentBase
        config={config}
        flightSegments={flightSegments}
        initialSegmentIndex={segmentIndex}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(
            {
              ...segment,
              cabinClass: cabin,
              equipment: segment.equipment,
            },
            index
          )
        }
        availability={[]}
        passengers={[]} 
        showSegmentSelector={false}
        flightInfo={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Flight info:</strong>
              <div>{currentSegment.origin} → {currentSegment.destination}</div>
              <div>Date: {currentSegment.departureDateTime || 'not specified'}</div>
              <div>Equipment: {currentSegment.equipment?.EncodeDecodeElement?.SimplyDecoded || 'Unknown'}</div>
              <div>Class: {cabinClass}</div>
            </div>
            <SeatLegend />
          </div>
        }
      />
    </div>
  );
};

export default SeatMapComponentShopping;