// file: SeatMapComponentPnr.tsx

// file: SeatMapComponentPnr.tsx

import * as React from 'react';
import { useState } from 'react';
import SeatMapComponentBase from './SeatMapComponentBase';
import { generateFlightData } from '../../utils/generateFlightData';

interface Passenger {
  id: string;
  givenName: string;
  surname: string;
  seatAssignment?: string;
  label?: string;
}

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

  const [segmentIndex, setSegmentIndex] = useState<number>(selectedSegmentIndex);
  const [cabinClass, setCabinClass] = useState<'Y' | 'S' | 'C' | 'F' | 'A'>(
    flightSegments[segmentIndex]?.cabinClass || 'Y'
  );

  const segment = flightSegments[segmentIndex];
  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'неизвестно';

  const [selectedPassengerIds, setSelectedPassengerIds] = useState<string[]>(
    Array.isArray(passengers) ? passengers.map((p) => p.id) : []
  );

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
            setCabinClass('Y'); // сбрасываем класс по умолчанию
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

      {/* 👤 Селектор пассажиров
      {passengers.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>Пассажиры:</strong>
          <div>
            {passengers.map((p) => {
              const [surname, rawGivenNameAndTitle] = (p.label || '').split('/');
              const titleMatch = rawGivenNameAndTitle?.match(/(MR|MRS|MS|DR)$/);
              const title = titleMatch ? titleMatch[0] : '';
              const givenName = p.givenName || rawGivenNameAndTitle?.replace(title, '').trim();

              const display = `${surname} ${givenName}/${title}`;

              return (
                <label key={p.id} style={{ marginRight: '1rem' }}>
                  <input
                    type="checkbox"
                    name="passenger"
                    value={p.id}
                    checked={selectedPassengerIds.includes(p.id)} // Можно выбрать несколько пассажиров
                    onChange={() =>
                      setSelectedPassengerIds((prev) =>
                        prev.includes(p.id)
                          ? prev.filter((id) => id !== p.id) // Удаляем, если уже выбран
                          : [...prev, p.id] // Добавляем нового пассажира
                      )
                    }
                  />
                  {display}
                </label>
              );
            })}
          </div>
        </div>
      )} */}

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
      />
    </div>
  );
};

export default SeatMapComponentPnr;