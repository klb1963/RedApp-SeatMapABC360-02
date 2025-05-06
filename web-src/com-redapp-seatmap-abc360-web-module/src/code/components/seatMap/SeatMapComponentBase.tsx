// file SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { mapCabinToCode } from '../../utils/mapCabinToCode';
import { getService } from '../../Context';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';

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
  assignedSeats
}) => {
  const [segmentIndex, setSegmentIndex] = useState(initialSegmentIndex);
  const [flight, setFlight] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedSeat, setSelectedSeat] = useState<any>(null); // 🆕 выбранное место

  const currentSegment = flightSegments[segmentIndex];

  // 🆕 Обработчики кнопок

  // бронирование выбранного места
  const handleConfirmSeat = () => {
    if (!selectedSeat) return;
  
    const {
      passengerId,
      seatLabel,
      value,
      currency,
      label,
      flightNumber,
      airlineCode,
      origin,
      destination,
      departureDate
    } = selectedSeat;
  
    const publicModalsService = getService(PublicModalsService);
    const UpdatePNRComponent = require('../../components/pnrServices/UpdatePNR').UpdatePNR;
  
    publicModalsService.showReactModal({
      header: 'Назначение места',
      component: React.createElement(UpdatePNRComponent, {
        passengerRef: passengerId,
        seatNumber: seatLabel,
        amount: value,
        currency,
        passengerName: label,
        flightNumber,
        airlineCode,
        origin,
        destination,
        departureDate
      }),
      modalClassName: 'seatmap-modal-class'
    });
  };

  // обработка отказа от выбранного места
  const handleResetSeat = () => {
    setSelectedSeat(null);

    // 🔁 Повторная отправка сообщения в iframe
    if (!flight || !iframeRef.current?.contentWindow) return;

    const message: Record<string, string> = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      currentDeckIndex: '0',
      availability: JSON.stringify(availability),
      passengers: JSON.stringify(passengers)
    };

    console.log('🔁 Перерисовка карты мест после сброса выбора');
    iframeRef.current.contentWindow.postMessage(message, '*');
  };

  useEffect(() => {
    // тот же useEffect генерации flight
    if (!flightSegments.length || !currentSegment) {
      console.warn('⛔ Нет сегментов или текущий сегмент не определён');
      setFlight(null);
      return;
    }
    const generatedFlight = generateFlightData(currentSegment, segmentIndex, cabinClass);
    if (!generatedFlight || generatedFlight.flightNo === '000' || generatedFlight.airlineCode === 'XX') {
      console.warn('⛔ generateFlightData: flight некорректен.', generatedFlight);
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

  // ============= отправка данных в библиотеку ==============

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
  
      console.log('📨 Отправка данных в iframe после загрузки');
      iframe.contentWindow?.postMessage(message, '*');
    };
  
    // Подписка на onload iframe
    iframe.addEventListener('load', handleLoad);
  
    // Очистка при размонтировании
    return () => {
      iframe.removeEventListener('load', handleLoad);
    };
  }, [flight, config, availability, passengers]);

  // ====================================================

  // 👂 Ловим seatSelected
  useEffect(() => {
    const appMessageListener = (event: MessageEvent) => {
      const { type, onSeatSelected } = event.data || {};
      if (type === 'seatMaps' && onSeatSelected) {
        console.log('✅ Место выбрано:', onSeatSelected);
        setSelectedSeat(onSeatSelected);
      }
    };
    window.addEventListener('message', appMessageListener);
    return () => window.removeEventListener('message', appMessageListener);
  }, []);

  // =============== отображаем в окне ================
  return (
    <div style={{ padding: '1rem' }}>
      {/* 👇 Селектор сегмента (если включён) */}
      {showSegmentSelector && (
        <div style={{ marginBottom: '1rem' }}>
          <label>Сегмент:</label>
          <select
            value={segmentIndex}
            onChange={(e) => setSegmentIndex(Number(e.target.value))}
          >
            {flightSegments.map((seg: any, idx: number) => (
              <option key={idx} value={idx}>
                {seg.origin} → {seg.destination}, рейс {seg.flightNumber}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 🆕 Блок подтверждения */}
      {selectedSeat && (
        <div
          style={{
            background: '#f0f0f0',
            padding: '1rem',
            marginBottom: '1rem',
            border: '1px solid #ccc'
          }}
        >
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Вы выбрали место:</strong>{' '}
                {/* <span style={{ color: '#007bff' }}>{selectedSeat.seatLabel}</span>{' '}
                для <span style={{ color: '#28a745' }}>{selectedSeat.label || 'пассажира'}</span> */}
              </div>
          <button onClick={handleConfirmSeat} style={{ marginRight: '0.5rem' }}>
            ✅ Подтвердить
          </button>
          <button onClick={handleResetSeat}>🔁 Сбросить</button>
        </div>
      )}

      {/* 👉 iframe с картой салона */}
      <iframe
        ref={iframeRef}
        src="https://quicket.io/react-proxy-app/"
        width="100%"
        height="800"
        style={{ border: '1px solid #ccc' }}
        title="SeatMapIframe"
      />
    </div>
  );
};

export default SeatMapComponentBase;