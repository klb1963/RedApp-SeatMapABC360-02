// file SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { FlightData } from '../../utils/generateFlightData';
import SeatMapModalLayout from './SeatMapModalLayout';

interface Passenger {
  id: string;
  givenName: string;
  surname: string;
  seatAssignment?: string;
  label?: string;
}

interface SelectedSeat {
  passengerId: string;
  seatLabel: string;
}

interface SeatMapComponentBaseProps {
  config: any;
  flightSegments: any[];
  initialSegmentIndex: number;
  showSegmentSelector?: boolean;
  cabinClass: string;
  availability: any[];
  passengers: Passenger[];
  generateFlightData: (segment: any, index: number, cabin: string) => FlightData;
  onSeatChange?: (seats: SelectedSeat[]) => void;
  passengerPanel?: React.ReactNode;
  selectedSeats?: SelectedSeat[];
}

const SeatMapComponentBase: React.FC<SeatMapComponentBaseProps> = ({
  config,
  flightSegments,
  initialSegmentIndex,
  showSegmentSelector = false,
  cabinClass,
  availability,
  passengers,
  generateFlightData,
  onSeatChange,
  passengerPanel
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ✅ Храним выбранные места
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  // ✅ Активный пассажир
  const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(
    passengers?.[0]?.id || null
  );

  // ✅ Определяем сегмент и самолет
  const segment = flightSegments[initialSegmentIndex];
  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'неизвестно';

  // ⏫ Обработка событий от iframe (выбор места)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'seatSelected') {
        const { seatLabel } = event.data;
        if (!selectedPassengerId || !seatLabel) return;

        const updatedSeats = [
          ...selectedSeats.filter(s => s.passengerId !== selectedPassengerId),
          { passengerId: selectedPassengerId, seatLabel }
        ];

        setSelectedSeats(updatedSeats);
        onSeatChange?.(updatedSeats);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [selectedPassengerId, selectedSeats, onSeatChange]);

  // ⏫ Отправляем данные в iframe
  useEffect(() => {
    if (!iframeRef.current) return;

    const flightData = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const payload = {
      config,
      flight: flightData,
      availability,
      passengers: passengers.map((p) => ({
        id: p.id,
        label: p.label || `${p.givenName} ${p.surname}`,
        seat: selectedSeats.find((s) => s.passengerId === p.id)?.seatLabel || null
      }))
    };

    const iframeWindow = iframeRef.current.contentWindow;
    iframeWindow?.postMessage(payload, '*');
  }, [config, flightSegments, initialSegmentIndex, cabinClass, availability, passengers, selectedSeats, generateFlightData]);

  // ⏹ Сброс всех мест
  const handleResetSeat = () => {
    setSelectedSeats([]);
    onSeatChange?.([]);
  };

  return (
    <SeatMapModalLayout
      flightInfo={
        <div>
          <div><strong>{segment?.airlineCode} {segment?.flightNumber}</strong></div>
          <div>{segment?.origin} → {segment?.destination}</div>
          <div>Дата вылета: {segment?.departureDate}</div>
          <div>Самолёт: {equipment}</div>
          <div>Класс: {segment?.cabinClass}</div>
          <hr />
          <div><strong>Обозначения:</strong></div>
          <ul style={{ paddingLeft: '1rem' }}>
            <li>🟩 — свободно</li>
            <li>⬛ — занято</li>
            <li>🔲 — недоступно</li>
            <li>🪑 — выбрано</li>
          </ul>
        </div>
      }
      passengerPanel={
        <div>
          <strong>Passenger(s)</strong>
          <div style={{ margin: '1rem 0' }}>
            {passengers.map((p) => {
              const seat = selectedSeats.find((s) => s.passengerId === p.id);
              const isActive = p.id === selectedPassengerId;
              return (
                <div key={p.id} style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="activePassenger"
                      value={p.id}
                      checked={isActive}
                      onChange={() => setSelectedPassengerId(p.id)}
                    />
                    {p.label || `${p.givenName} ${p.surname}`}
                  </label>
                  <div>
                    Seat: <strong>{seat?.seatLabel || '—'}</strong>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={handleResetSeat}>🔁 Сбросить все</button>
        </div>
      }
    >
      <iframe
        ref={iframeRef}
        title="Seat Map"
        src="https://quicket.io/react-proxy-app"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </SeatMapModalLayout>
  );

};

export default SeatMapComponentBase;