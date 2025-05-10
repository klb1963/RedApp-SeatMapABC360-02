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

  // === Приём событий от библиотеки ===
  useEffect(() => {
    const appMessageListener = (event: MessageEvent) => {
      if (event.origin !== 'https://quicket.io') return;

      let parsed;
      try {
        parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if ('onSeatSelected' in parsed && Array.isArray(parsed.onSeatSelected)) {
        const updated = parsed.onSeatSelected
          .filter(p => p.id && p.seat?.seatLabel)
          .map(p => ({
            passengerId: p.id,
            seatLabel: p.seat.seatLabel
          }));

        setSelectedSeats(updated);
        onSeatChange?.(updated);
      }

      if ('onSeatUnselected' in parsed && parsed.onSeatUnselected?.id) {
        const passengerId = parsed.onSeatUnselected.id;
        setSelectedSeats(prev => {
          const newSeats = prev.filter(s => s.passengerId !== passengerId);
          onSeatChange?.(newSeats);
          return newSeats;
        });
      }
    };

    window.addEventListener('message', appMessageListener);
    return () => window.removeEventListener('message', appMessageListener);
  }, [onSeatChange]);

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


  return (
    <SeatMapModalLayout
      flightInfo={flightInfo}
      passengerPanel={
        <div>
          <strong>Passengers</strong>
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
        onLoad={handleIframeLoad}
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </SeatMapModalLayout>
  );
};

export default SeatMapComponentBase;