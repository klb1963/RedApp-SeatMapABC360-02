// file: code/components/seatMap/panels/PassengerPanel.tsx

/**
 * PassengerPanel.tsx
 * 
 * 🧍 SeatMap Passenger Selection Panel – RedApp ABC360
 * 
 * A UI component that:
 * - Displays the list of passengers
 * - Shows currently selected passenger and their assigned seat
 * - Allows agents to switch focus between passengers (radio buttons)
 * - Shows boarding completion status if all passengers are seated
 * - Provides a "Reset all" button to clear all seat assignments
 * 
 * Integrated into the SeatMap workflow for managing per-passenger seat selection.
 */

import * as React from 'react';
import { PassengerOption } from '../../../utils/parcePnrData';
import { SelectedSeat } from '../SeatMapComponentBase';
import { t } from '../../../Context';

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
      <strong>{t('seatMap.passengers')}</strong> {/* i18n */}

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
          {t('seatMap.boardingComplete')} {/* i18n */}
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
                {t('seatMap.seat')}: <strong>{seat?.seatLabel || t('seatMap.seatNotAssigned')}</strong> {/* i18n */}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {t('seatMap.seatsAssigned')}: {/* i18n */}
          {' '}
          {passengers.filter(p => selectedSeats.some(s => s.passengerId === String(p.id))).length}
          {' '}{t('seatMap.of')} {passengers.length} {/* i18n */}
        </div>
        <button onClick={handleResetSeat}>{t('seatMap.resetAll')}</button> {/* i18n */}
      </div>
    </div>
  );
};