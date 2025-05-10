// file: SeatMapComponentPnr.tsx

import * as React from 'react';
import { useState } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';
import SeatLegend from './SeatLegend';

// Интерфейс пассажира
interface Passenger {
  id: string;
  givenName: string;
  surname: string;
  seatAssignment?: string;
  label?: string;
}

// Интерфейс пропсов
interface SeatMapComponentPnrProps {
  config: any;
  flightSegments: any[];
  selectedSegmentIndex?: number;
  availability?: any[];
  passengers?: Passenger[];
  showSegmentSelector?: boolean;
}

const SeatMapComponentPnr: React.FC<SeatMapComponentPnrProps> = ({
  config,
  flightSegments = [],
  selectedSegmentIndex = 0,
  availability = [],
  passengers = [],
  showSegmentSelector = true
}) => {
  if (!flightSegments.length) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        ❌ Нет доступного сегмента
      </div>
    );
  }

  // состояние: выбранный сегмент и класс обслуживания
  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>(
    flightSegments[segmentIndex]?.cabinClass || 'Y'
  );

  const segment = flightSegments[segmentIndex];

  const flightInfo = (
    <div>
      <div><strong>Flight info:</strong></div>
      <div>{segment.origin} → {segment.destination}</div>
      <div>📅 Date: {segment.departureDateTime?.split?.('T')[0] || 'not specified'}</div>
      <div>✈️ Equipment: {typeof segment.equipment === 'object'
        ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
        : segment.equipment || 'unknown'}
      </div>
      <div>💺 Class: {cabinClass}</div>
      <hr />
      <SeatLegend/>
      {/* <strong>Legend:</strong>
      <ul style={{ paddingLeft: '1rem' }}>
        <li>🟩 — available</li>
        <li>🟧 — available for a fee</li>
        <li>❌ — unavailable</li>
        <li>☑️ — occupied</li>
      </ul> */}
    </div>
  );

  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'неизвестно';

  // состояние: выбранные ID пассажиров
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<string[]>(
    Array.isArray(passengers) ? passengers.map((p) => p.id) : []
  );

  // состояние: выбранные места для всех пассажиров
  const [selectedSeats, setSelectedSeats] = useState<
    { passengerId: string; seatLabel: string }[]
  >([]); // 🆕 добавлен массив мест

  const handleTogglePassenger = (id: string) => {
    setSelectedPassengerIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const selectedPassengers = (Array.isArray(passengers)
    ? passengers.filter((p) => selectedPassengerIds.includes(p.id))
    : []) as Passenger[];

  return (
    <div style={{ padding: '1rem' }}>
      {/* 🔝 Сегмент и Самолёт на одной строке */}
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
          <select value={segmentIndex} onChange={(e) => {
            setSegmentIndex(Number(e.target.value));
            setCabinClass('Y');
          }}>
            {flightSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin} → {seg.destination}, рейс {seg.flightNumber}
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

      {/* 🧩 Карта мест */}
      <SeatMapComponentBase
        config={config}
        flightSegments={flightSegments}
        initialSegmentIndex={segmentIndex}
        showSegmentSelector={false}
        cabinClass={cabinClass}
        generateFlightData={(segment, index, cabin) =>
          generateFlightData(segment, index, cabin)
        }
        availability={Array.isArray(availability) ? availability : []}
        passengers={selectedPassengers}
        // 🆕 Передаём setSelectedSeats и selectedSeats в дочерний компонент
        onSeatChange={(updatedSeats) => setSelectedSeats(updatedSeats)}
        selectedSeats={selectedSeats}
        flightInfo = {flightInfo}
      />
    </div>
  );
};

export default SeatMapComponentPnr;