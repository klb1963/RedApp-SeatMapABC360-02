import * as React from 'react';
import { PassengerOption } from '../../../utils/parcePnrData';
import { SelectedSeat } from '../SeatMapComponentBase';

interface Props {
  passengers: PassengerOption[];
  selectedSeats: SelectedSeat[];
  selectedPassengerId: string;
  setSelectedPassengerId: (id: string) => void;
  handleResetSeat: () => void;
  boardingComplete: boolean;
}

export const PassengerPanel: React.FC<Props> = ({
  passengers,
  selectedSeats,
  selectedPassengerId,
  setSelectedPassengerId,
  handleResetSeat,
  boardingComplete
}) => {
  return (
    <div>
      <strong>Passengers</strong>

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
        {passengers.map((p) => {
          const passengerId = String(p.id);
          const seat = selectedSeats.find(s => s.passengerId === passengerId);
          return (
            <div key={p.id} style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="activePassenger"
                  value={p.id}
                  checked={selectedPassengerId === passengerId}
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
          {passengers.filter(p => selectedSeats.some(s => s.passengerId === String(p.id))).length}
          {' '}of {passengers.length}
        </div>
        <button onClick={handleResetSeat}>🔁 Reset all</button>
      </div>
    </div>
  );
};