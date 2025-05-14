// file: SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { FlightData } from '../../utils/generateFlightData';
import SeatMapModalLayout from './SeatMapModalLayout';
import { PassengerOption } from '../../utils/parcePnrData';
import { createPassengerPayload } from './helpers/createPassengerPayload';
import { SeatMapMessagePayload } from './types/SeatMapMessagePayload';
import { useSyncOnSegmentChange } from './hooks/useSyncOnSegmentChange';
import { useSyncOnCabinClassChange } from './hooks/useSyncOnCabinClassChange';
import { useOnIframeLoad } from './hooks/useOnIframeLoad';
import { useSeatSelectionHandler } from './hooks/useSeatSelectionHandler';

// global variable 
declare global {
  interface Window {
    selectedSeats?: SelectedSeat[];
  }
}

export interface SelectedSeat {
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
  passengers: PassengerOption[];
  generateFlightData: (segment: any, index: number, cabin: string) => FlightData;
  onSeatChange?: (seats: SelectedSeat[]) => void;
  passengerPanel?: React.ReactNode;
  selectedSeats?: SelectedSeat[];
  flightInfo?: React.ReactNode;
}

// 📌 Индексируем пассажиров
function ensurePassengerIds(passengers: PassengerOption[]): PassengerOption[] {
  return passengers.map((p, index) => ({
    ...p,
    id: typeof p.id === 'string' && p.id.trim() !== '' ? p.id : `pax-${index}`,
    value: typeof p.value === 'string' && p.value.trim() !== '' ? p.value : `pax-${index}`
  }));
}

// === Component ===
const SeatMapComponentBase: React.FC<SeatMapComponentBaseProps> = ({
  config,
  flightSegments,
  initialSegmentIndex,
  cabinClass,
  availability,
  passengers,
  generateFlightData,
  onSeatChange,
  flightInfo
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // отслеживаем boardingComplete
  const [boardingComplete, setBoardingComplete] = useState(false);

  // ✅ Обеспечиваем корректные и уникальные строковые ID для пассажиров
  const [cleanPassengers] = useState(() => ensurePassengerIds(passengers));

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);

  // 🔁 Синхронизация selectedSeats с глобальным window
  useEffect(() => {
    window.selectedSeats = selectedSeats;
  }, [selectedSeats]);

  // selectedPassengerId изначально пустой
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');

  // ✅ Ставим первого пассажира как выбранного при появлении массива
  useEffect(() => {
    if (cleanPassengers.length > 0 && !selectedPassengerId) {
      const firstId = String(cleanPassengers[0].id);
      setSelectedPassengerId(firstId);
      console.log('👤 selectedPassengerId инициализирован:', firstId);
    }
  }, [passengers, selectedPassengerId]);

  const segment = flightSegments[initialSegmentIndex];

  const handleResetSeat = () => {
    setSelectedSeats([]);
    setSelectedPassengerId(cleanPassengers.length > 0 ? cleanPassengers[0].id : '');
    onSeatChange?.([]);
    setBoardingComplete(false); // 🧽 Убираем сообщение

    // 🔁 Обновляем карту — все места сброшены
    const iframe = iframeRef.current;
    if (!iframe) return;

    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const availabilityData = availability || [];

    const passengerList = cleanPassengers.map((p, i) =>
      createPassengerPayload(p, i, selectedPassengerId, selectedSeats)
    );

    const message: SeatMapMessagePayload  = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      availability: JSON.stringify(availabilityData),
      passengers: JSON.stringify(passengerList),
      currentDeckIndex: '0'
    };

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('🔁 PostMessage после Reset all');

  };

  // ======== 🗺️ начальная загрузка карты ==================
  const handleIframeLoad = useOnIframeLoad({
    iframeRef,
    config,
    segment,
    initialSegmentIndex,
    cabinClass,
    availability,
    cleanPassengers,
    selectedPassengerId,
    selectedSeats,
    generateFlightData
  });   


  // ============ 🔁 SyncOnCabinClassChange ===================
  useSyncOnCabinClassChange({
    iframeRef,
    config,
    segment,
    initialSegmentIndex,
    cabinClass,
    availability,
    cleanPassengers,
    selectedPassengerId,
    selectedSeats
  });

  // =========== 🔁 SyncOnSegmentChange ========================
  useSyncOnSegmentChange({
    config,
    segment,
    initialSegmentIndex,
    cabinClass,
    availability,
    passengers: cleanPassengers,
    selectedPassengerId,
    selectedSeats,
    iframeRef,
    generateFlightData
  });

  // ===  🛳️ 🛫  Посадка пассажиров - обработка выбора мест от библиотеки ===
  useSeatSelectionHandler({
    cleanPassengers,
    selectedPassengerId,
    setSelectedPassengerId,
    setSelectedSeats,
    setBoardingComplete,
    onSeatChange
  });

  // ============== Passengers =====================
  const passengerPanel = (
    <>
      {console.log('📺 Re-render passengerPanel:', selectedSeats)}
      <div>
        <strong>Passengers</strong>

        {/* ✅ Уведомление о завершённой рассадке */}
        {boardingComplete && (
          <div style={{
            backgroundColor: '#e6ffe6',
            padding: '0.75rem',
            margin: '1rem 0',
            border: '1px solid #00cc66',
            borderRadius: '5px',
            fontWeight: 'bold',
            color: '#006633'
          }}>
            ✅ Boarding complete — all passengers have seats
          </div>
        )}

        <div style={{ margin: '1rem 0' }}>
          {cleanPassengers.map((p) => {
            const passengerId = String(p.id); // 🧠 Приведение к строке
            const seat = selectedSeats.find((s) => s.passengerId === passengerId);
            const isActive = selectedPassengerId === passengerId;

            return (
              <div key={p.id} style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    name="activePassenger"
                    value={p.id}
                    checked={selectedPassengerId === String(p.id)}
                    onChange={() => setSelectedPassengerId(passengerId)}
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
              cleanPassengers.filter((p) =>
                selectedSeats.some((s) => s.passengerId === String(p.id))
              ).length
            } of {cleanPassengers.length}
          </div>
          <button onClick={handleResetSeat}>🔁 Reset all</button>
        </div>
      </div>
    </>
  );
  // ✊ ⚒️ 🧰 ================= show Seat Map =====================
  
  return (
    <SeatMapModalLayout
      flightInfo={flightInfo}
      passengerPanel={passengerPanel} // ⬅️ вот так, именно через пропс

    >
      <iframe
        ref={iframeRef}
        title="Seat Map"
        src="https://quicket.io/react-proxy-app/"
        onLoad={handleIframeLoad}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </SeatMapModalLayout>
  );

};

export default SeatMapComponentBase;