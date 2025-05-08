// file: SeatMapComponentBase.tsx

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
  initials?: string;
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
  flightInfo?: React.ReactNode; // ?????
}

const SeatMapComponentBase: React.FC<SeatMapComponentBaseProps> = ({
  config,
  flightSegments,
  initialSegmentIndex,
  cabinClass,
  availability,
  passengers,
  generateFlightData,
  onSeatChange,
  flightInfo // ✅ Добавлено
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // ✅ Храним выбранные места
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  // ✅ Активный пассажир — выбираем первого по умолчанию
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>(
    passengers.length > 0 ? passengers[0].id : ''
  );  

  // 🧮 Количество выбранных мест
  const selectedCount = passengers.filter(p =>
    selectedSeats.some(s => s.passengerId === p.id)
  ).length;

  // ✅ Определяем сегмент и самолет
  const segment = flightSegments[initialSegmentIndex];
  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'неизвестно';

  // ======== ⏫ message for quicket.io preparation ==================
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
  
    // ==== flight =======
    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
  
    // ==== availability =======
    const availabilityData = availability || [];
  
    // ============ passengers =======================
    // 🎨 colors
    const colorPalette = ['blue', 'orange', 'green', 'purple', 'teal', 'red'];
  
    // 🔤 initials
    const getInitials = (p: Passenger) => {
      return `${p.givenName?.[0] || ''}${p.surname?.[0] || ''}`.toUpperCase(); // ✅ KG
    };    
  
    const passengerList = passengers.map((p, index) => ({
      id: p.id || index.toString(), // ✅ Используем индекс, если id отсутствует
      passengerType: 'ADT',
      seat: selectedSeats.find((s) => s.passengerId === p.id) || null,
      passengerLabel: p.label || `${p.givenName} ${p.surname}`,
      passengerColor: colorPalette[index % colorPalette.length],
      initials: p.initials || getInitials(p), // ✅ Используем предоставленные Sabre initials
      readOnly: p.id !== selectedPassengerId 
    }));
  
    console.log('🎫 Пассажиры в библиотеку:', passengerList);
    console.log('👤 Активный:', selectedPassengerId);
  
    const message = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      availability: JSON.stringify(availabilityData),
      passengers: JSON.stringify(passengerList),
      currentDeckIndex: "0"
    };
  
    const targetOrigin = "https://quicket.io";
  
    const handleIframeLoad = () => {
      console.log('✅ iframe загружен, отправка:', message);
      iframe.contentWindow?.postMessage(message, targetOrigin);
    };

    // 👉 отправка при загрузке iframe
    iframe.addEventListener('load', handleIframeLoad);

    // 👉 если уже загружен — отправить сразу
    if (iframe.contentWindow) {
      console.log('📤 iframe уже загружен, отправка данных напрямую:', message);
      iframe.contentWindow.postMessage(message, targetOrigin);
    }

    // 🔄 очистка при размонтировании
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
};
  }, [config, flightSegments, initialSegmentIndex, cabinClass, passengers, selectedSeats, selectedPassengerId]);

  // ============= message send =========================

  // ⏹ Сброс всех мест
  const handleResetSeat = () => {
    setSelectedSeats([]);
    onSeatChange?.([]);
  };

  return (
    <SeatMapModalLayout
      flightInfo={flightInfo}
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
  
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              ✅ Выбрано мест:{' '}
              {
                passengers.filter((p) =>
                  selectedSeats.some((s) => s.passengerId === p.id)
                ).length
              } из {passengers.length}
            </div>
            <button onClick={handleResetSeat}>🔁 Сбросить все</button>
          </div>
        </div>
      }
    >
      <iframe
        ref={iframeRef}
        title="Seat Map"
        src="https://quicket.io/react-proxy-app/"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </SeatMapModalLayout>
  );
  
};

export default SeatMapComponentBase;
