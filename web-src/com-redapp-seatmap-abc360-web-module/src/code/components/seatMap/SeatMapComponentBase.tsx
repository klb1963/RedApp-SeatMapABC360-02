// file SeatMapComponentBase.tsx

// file: SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { mapCabinToCode } from '../../utils/mapCabinToCode';
import { getService } from '../../Context';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import SeatMapModalLayout from './SeatMapModalLayout';

interface SeatMapComponentBaseProps {
  config: any;
  flightSegments: any[];
  initialSegmentIndex?: number;
  generateFlightData: (segment: any, segmentIndex: number, cabinClass?: string) => any;
  cabinClass: 'F' | 'C' | 'S' | 'Y' | 'A' | 'P' | 'B';
  layoutData?: any;
  availability?: any[];
  passengers?: any[];
  showSegmentSelector?: boolean;
  assignedSeats?: { passengerId: string; seat: string }[];

   // 🆕 Добавить эти строки:
  selectedSeats?: any[];
  onSeatChange?: (updatedSeats: any[]) => void;
}

const SeatMapComponentBase: React.FC<SeatMapComponentBaseProps> = ({
  config,
  flightSegments,
  initialSegmentIndex = 0,
  generateFlightData,
  cabinClass,
  availability = [],
  passengers = [],
  showSegmentSelector = true,
  assignedSeats,
  onSeatChange // ✅ получаем из пропсов
}) => {
  const [segmentIndex, setSegmentIndex] = useState(initialSegmentIndex);
  const [flight, setFlight] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]); // ✅ массив всех выбранных мест

  const currentSegment = flightSegments[segmentIndex];

  const handleResetSeat = () => {
    setSelectedSeats([]);
    if (!flight || !iframeRef.current?.contentWindow) return;

    const message: Record<string, string> = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      currentDeckIndex: '0',
      availability: JSON.stringify(availability),
      passengers: JSON.stringify(passengers)
    };

    iframeRef.current.contentWindow.postMessage(message, '*');
  };

  useEffect(() => {
    if (!flightSegments.length || !currentSegment) {
      setFlight(null);
      return;
    }
    const generatedFlight = generateFlightData(currentSegment, segmentIndex, cabinClass);
    if (!generatedFlight || generatedFlight.flightNo === '000' || generatedFlight.airlineCode === 'XX') {
      setFlight(null);
      return;
    }

    const cabinClassForLib = mapCabinToCode(cabinClass);
    const flightForIframe = {
      ...generatedFlight,
      cabinClass: cabinClassForLib,
      passengerType: 'ADT'
    };

    setFlight(flightForIframe);
  }, [flightSegments, segmentIndex, cabinClass]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      if (!flight || flight.flightNo === '000' || flight.airlineCode === 'XX') return;

      const message: Record<string, string> = {
        type: 'seatMaps',
        config: JSON.stringify(config),
        flight: JSON.stringify(flight),
        currentDeckIndex: '0',
        availability: JSON.stringify(availability),
        passengers: JSON.stringify(passengers)
      };

      iframe.contentWindow?.postMessage(message, '*');
    };

    iframe.addEventListener('load', handleLoad);
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [flight, config, availability, passengers]);

  // 👂 Обработка выбора места
  useEffect(() => {
    const appMessageListener = (event: MessageEvent) => {
      const { type, onSeatSelected } = event.data || {};
      if (type === 'seatMaps' && onSeatSelected) {
        console.log('✅ Место выбрано:', onSeatSelected);

        // 🔁 обновляем массив выбранных мест
        setSelectedSeats((prev) => {
          const updated = [...prev.filter(s => s.passengerId !== onSeatSelected.passengerId), onSeatSelected];
          // 👉 вызываем внешний обработчик, если есть
          onSeatChange?.(updated);
          return updated;
        });
      }
    };

    window.addEventListener('message', appMessageListener);
    return () => window.removeEventListener('message', appMessageListener);
  }, [onSeatChange]);

  return (
    <SeatMapModalLayout
      flightInfo={
        <div>
          <h4>{flight?.airlineCode} {flight?.flightNo}</h4>
          <p>{flight?.origin} → {flight?.destination}</p>
          <p>Дата вылета: {flight?.departureDate}</p>
          <p>Самолёт: {flight?.equipmentType || 'неизвестен'}</p>
          <p>Класс: {cabinClass}</p>
        </div>
      }
      passengerPanel={
        <div>
          <strong>Пассажиры:</strong>
          <div style={{ margin: '0.5rem 0' }}>
            {passengers.map((p) => {
              const seat = selectedSeats.find((s) => s.passengerId === p.id);
              return (
                <div key={p.id} style={{ marginBottom: '0.5rem' }}>
                  <div>{p.label}</div>
                  {seat && <div>🪑 Выбрано: {seat.seatLabel}</div>}
                </div>
              );
            })}
          </div>
          <hr />
          <div>
            <button onClick={handleResetSeat}>🔁 Сбросить все</button>
          </div>
        </div>
      }
    >
      <iframe
        ref={iframeRef}
        src="https://quicket.io/react-proxy-app/"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="SeatMapIframe"
      />
    </SeatMapModalLayout>
  );
};

export default SeatMapComponentBase;