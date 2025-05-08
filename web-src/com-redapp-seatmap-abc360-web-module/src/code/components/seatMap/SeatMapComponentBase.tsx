// file: SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { FlightData } from '../../utils/generateFlightData';
import SeatMapModalLayout from './SeatMapModalLayout';

// 🧑 Интерфейс одного пассажира
interface Passenger {
  id: string;
  givenName: string;
  surname: string;
  seatAssignment?: string;
  label?: string;
  initials?: string;
}


// 💺 Интерфейс для выбранного места
interface SelectedSeat {
  passengerId: string;
  seatLabel: string;
}

// 📦 Интерфейс для пропсов компонента
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

// 🛠 Основной компонент
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

  // ✅ Определяем текущий сегмент и самолет
  const segment = flightSegments[initialSegmentIndex];
  const equipment =
    typeof segment?.equipment === 'object'
      ? segment.equipment?.EncodeDecodeElement?.SimplyDecoded
      : segment?.equipment || 'неизвестно';

  // 📡 Отправка данных в iframe при монтировании или обновлении страницы
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
  
    // 🔤 Генерация инициалов: фамилия + имя
    const getInitials = (p: Passenger) => {
      const surnameInitial = p.surname?.[0]?.toUpperCase() || '';
      const givenInitial = p.givenName?.[0]?.toUpperCase() || '';
      return `${surnameInitial}${givenInitial}`; // например: K + G = KG
    };    
  
    // 🧑‍🤝‍🧑 Формируем список пассажиров для библиотеки
    const passengerList = passengers.map((p, index) => {
      const seatInfo = selectedSeats.find((s) => s.passengerId === p.id);
      const hasValidSeat = seatInfo?.seatLabel?.trim();

      return {
        id: p.id || index.toString(),
        passengerType: 'ADT',
        seat: hasValidSeat ? seatInfo : null, // ✅ только если seatLabel указан
        passengerLabel: p.label || `${p.givenName} ${p.surname}`,
        passengerColor: colorPalette[index % colorPalette.length],
        initials: p.initials || getInitials(p),
        readOnly: p.id !== selectedPassengerId,
      };
    });
  
    console.log('🎫 Пассажиры в библиотеку:', passengerList);
    console.log('👤 Активный:', selectedPassengerId);
  
    // ✉️ собираем message
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

    // 📤 Отправка данных при загрузке ifram
    iframe.addEventListener('load', handleIframeLoad);

    // 📤 Если уже загружен — отправляем сразу
    if (iframe.contentWindow) {
      console.log('📤 iframe уже загружен, отправка данных напрямую:', message);
      iframe.contentWindow.postMessage(message, targetOrigin);
    }

    //  🧹 Удаляем обработчик при размонтировании
    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
};
  }, [config, flightSegments, initialSegmentIndex, cabinClass, passengers, selectedSeats, selectedPassengerId]);

  // ============= message send =========================

  // 🔁 Сброс мест
  const handleResetSeat = () => {
    setSelectedSeats([]);
    onSeatChange?.([]);
  };

  // 🧱 Финальный JSX с макетом: левая (flightInfo), центральная (iframe), правая (пассажиры)
  
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
              ✅ Seats assigned:{' '}
              {
                passengers.filter((p) =>
                  selectedSeats.some((s) => s.passengerId === p.id)
                ).length
              } of {passengers.length}
            </div>
            <button onClick={handleResetSeat}>🔁 Reset all</button>
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
