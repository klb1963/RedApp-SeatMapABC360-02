// file: SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { FlightData } from '../../utils/generateFlightData';
import SeatMapModalLayout from './SeatMapModalLayout';

// === Interfaces ===
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
  flightInfo?: React.ReactNode;
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

  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>(
    passengers.length > 0 ? passengers[0].id : ''
  );

  const segment = flightSegments[initialSegmentIndex];

  const handleResetSeat = () => {
    setSelectedSeats([]);
    setSelectedPassengerId(passengers.length > 0 ? passengers[0].id : '');
    onSeatChange?.([]);
  };

  // начальная загрузка карты
  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const availabilityData = availability || [];

    const colorPalette = ['blue', 'orange', 'green', 'purple', 'teal', 'red'];
    const getInitials = (p: Passenger) =>
      `${p.givenName?.[0] || ''}${p.surname?.[0] || ''}`.toUpperCase();

    const passengerList = passengers.map((p, index) => ({
      id: p.id || index.toString(),
      passengerType: 'ADT',
      seat: selectedSeats.find(s => s.passengerId === p.id) || null,
      passengerLabel: p.label || `${p.givenName}/${p.surname}`,
      passengerColor: colorPalette[index % colorPalette.length],
      initials: getInitials(p),
      readOnly: p.id !== selectedPassengerId
    }));

    const message = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      availability: JSON.stringify(availabilityData),
      passengers: JSON.stringify(passengerList),
      currentDeckIndex: '0'
    };

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('📤 Первый postMessage отправлен через onLoad');
  };

  // 🔁 Обновляем карту при смене класса обслуживания
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const availabilityData = availability || [];

    const colorPalette = ['blue', 'orange', 'green', 'purple', 'teal', 'red'];
    const getInitials = (p: Passenger) =>
      `${p.givenName?.[0] || ''}${p.surname?.[0] || ''}`.toUpperCase();

    const passengerList = passengers.map((p, index) => ({
      id: p.id || index.toString(),
      passengerType: 'ADT',
      seat: selectedSeats.find(s => s.passengerId === p.id) || null,
      passengerLabel: p.label || `${p.givenName}/${p.surname}`,
      passengerColor: colorPalette[index % colorPalette.length],
      initials: getInitials(p),
      readOnly: p.id !== selectedPassengerId
    }));

    const message = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      availability: JSON.stringify(availabilityData),
      passengers: JSON.stringify(passengerList),
      currentDeckIndex: '0'
    };

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('📤 Обновление карты после смены cabinClass');
  }, [cabinClass]);

  // 🔁 Обновляем карту при смене выбранного сегмента
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const availabilityData = availability || [];

    const colorPalette = ['blue', 'orange', 'green', 'purple', 'teal', 'red'];
    const getInitials = (p: Passenger) =>
      `${p.givenName?.[0] || ''}${p.surname?.[0] || ''}`.toUpperCase();

    const passengerList = passengers.map((p, index) => ({
      id: p.id || index.toString(),
      passengerType: 'ADT',
      seat: selectedSeats.find(s => s.passengerId === p.id) || null,
      passengerLabel: p.label || `${p.givenName}/${p.surname}`,
      passengerColor: colorPalette[index % colorPalette.length],
      initials: getInitials(p),
      readOnly: p.id !== selectedPassengerId
    }));

    const message = {
      type: 'seatMaps',
      config: JSON.stringify(config),
      flight: JSON.stringify(flight),
      availability: JSON.stringify(availabilityData),
      passengers: JSON.stringify(passengerList),
      currentDeckIndex: '0'
    };

    const targetOrigin = new URL(iframe.src).origin;
    iframe.contentWindow?.postMessage(message, targetOrigin);
    console.log('📤 Обновление карты после смены сегмента');
  }, [initialSegmentIndex]);

  // ===  🛳️ 🛫  Посадка пассажиров ===
  useEffect(() => {
    const handleSeatSelection = (event: MessageEvent) => {

      console.log('📩 [seatmap] raw message received:', event);

      if (event.origin !== 'https://quicket.io') {
        console.warn('⚠️ Сообщение от неизвестного origin:', event.origin);
        return;
      }

      let parsed;
      try {
        parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        console.error('❌ Не удалось разобрать сообщение:', e, event.data);
        return;
      }

      console.log('📦 [seatmap] parsed object:', parsed);
      console.log('🔑 Keys in parsed:', Object.keys(parsed));

      let seatArray = parsed.onSeatSelected;
      console.log('🧪 Значение parsed.onSeatSelected:', seatArray);
      console.log('📏 Тип onSeatSelected:', typeof seatArray);

      if (typeof seatArray === 'string') {
        try {
          seatArray = JSON.parse(seatArray);
        } catch (e) {
          console.error('❌ Не удалось разобрать onSeatSelected:', e, seatArray);
          return;
        }
      }

      if (!Array.isArray(seatArray)) {
        console.warn('⚠️ seatArray не массив:', seatArray);
        return;
      }

      console.log('🎯 Обработка onSeatSelected:', seatArray);

      const updated = seatArray
        .filter(p => p.id && p.seat?.seatLabel)
        .map(p => ({
          passengerId: p.id,
          seatLabel: p.seat.seatLabel.toUpperCase()
        }));

      setSelectedSeats(prev => {
        const withoutOld = prev.filter(s => !updated.some(u => u.passengerId === s.passengerId));
        const merged = [...withoutOld, ...updated];
        console.log('🧩 Было:', prev);
        console.log('🔁 Добавляем:', updated);
        onSeatChange?.(merged);
        console.log('🧩 Обновленный selectedSeats:', merged);
        return merged;
      });
    };

    window.addEventListener('message', handleSeatSelection);
    return () => window.removeEventListener('message', handleSeatSelection);
  }, [onSeatChange]);

  // ============== Passengers =====================
  const passengerPanel = (
    <>
      {console.log('📺 Re-render passengerPanel:', selectedSeats)}
      <div>
        <strong>Passengers</strong>

        <div style={{ margin: '1rem 0' }}>
          {passengers.map((p) => {
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
                    checked={isActive}
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
              passengers.filter((p) =>
                selectedSeats.some((s) => s.passengerId === String(p.id))
              ).length
            } of {passengers.length}
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