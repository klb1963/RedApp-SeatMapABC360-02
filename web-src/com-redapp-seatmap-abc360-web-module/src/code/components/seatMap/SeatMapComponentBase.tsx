// file: SeatMapComponentBase.tsx

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { FlightData } from '../../utils/generateFlightData';
import SeatMapModalLayout from './SeatMapModalLayout';

// 🧑 Passenger interface
interface Passenger {
  id: string;
  givenName: string;
  surname: string;
  seatAssignment?: string;
  label?: string;
  initials?: string;
}

// 💺 Selected seat
interface SelectedSeat {
  passengerId: string;
  seatLabel: string;
}

// 📦 Component props
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

  // 📡 Send message to iframe when dependencies change
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const flight = generateFlightData(segment, initialSegmentIndex, cabinClass);
    const availabilityData = availability || [];

    const colorPalette = ['blue', 'orange', 'green', 'purple', 'teal', 'red'];

    const getInitials = (p: Passenger) => {
      const g = p.givenName?.charAt(0) || '';
      const s = p.surname?.charAt(0) || '';
      return `${g}${s}`.toUpperCase();
    };

    const passengerList = passengers.map((p, index) => ({
      id: p.id || index.toString(),
      passengerType: 'ADT',
      seat: selectedSeats.find((s) => s.passengerId === p.id) || null,
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
      currentDeckIndex: "0"
    };

    const targetOrigin = 'https://quicket.io';

    const handleIframeLoad = () => {
      iframe.contentWindow?.postMessage(message, targetOrigin);
    };

    iframe.addEventListener('load', handleIframeLoad);

    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, targetOrigin);
    }

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [config, flightSegments, initialSegmentIndex, cabinClass, passengers, selectedSeats, selectedPassengerId]);

  // 📥 Listen to seat selection and unselection from iframe
  useEffect(() => {
    const appMessageListener = (event: MessageEvent) => {
      const { type, data } = event.data;
      if (!type || !data) return;

      console.log('📩 Message received from SeatMap:', event.data);

      if (type === 'onSeatSelected') {
        const { seatLabel, passengerId } = data;
        if (!seatLabel || !passengerId) return;

        setSelectedSeats(prevSeats => {
          const updatedSeats = prevSeats.filter(s => s.passengerId !== passengerId);
          const newSeats = [...updatedSeats, { passengerId, seatLabel }];
          onSeatChange?.(newSeats);
          return newSeats;
        });
      }

      if (type === 'onSeatUnselected') {
        const { passengerId } = data;
        if (!passengerId) return;

        setSelectedSeats(prevSeats => {
          const newSeats = prevSeats.filter(s => s.passengerId !== passengerId);
          onSeatChange?.(newSeats);
          return newSeats;
        });
      }
    };

    window.addEventListener('message', appMessageListener);
    return () => {
      window.removeEventListener('message', appMessageListener);
    };
  }, [onSeatChange]);

  // ================ подключение слушателя ================
  
  const appMessageListener = event => {
    const { type, ...rest } = event.data;
    console.log(`Recieved!!!:`, event.data);

    if (type == 'seatMaps') {
      console.log(`message from react lib:`, event.data);
    }
  };

  window.addEventListener('message', appMessageListener);

  // =======================================================

  const handleResetSeat = () => {
    setSelectedSeats([]);
    onSeatChange?.([]);
  };

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
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </SeatMapModalLayout>
  );
};

export default SeatMapComponentBase;