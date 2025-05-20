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
      {/* <strong>{t('seatMap.passengers')}</strong> */}

      {boardingComplete && false && (
        <div style={{
          backgroundColor: '#e6ffe6',
          padding: '0.75rem',
          margin: '1rem 0',
          border: '1px solid #00cc66',
          borderRadius: '5px',
          fontWeight: 'bold',
          color: '#006633'
        }}>
          {t('seatMap.boardingComplete')}
        </div>
      )}

      <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>

        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>
              {t('seatMap.passengers')}: {passengers.length}
            </th>
            <th style={{ textAlign: 'right', paddingBottom: '0.5rem' }}>
              {t('seatMap.assignedSeats')}: {
                passengers.filter(p =>
                  selectedSeats.some(s => s.passengerId === String(p.id))
                ).length
              }
            </th>
          </tr>
        </thead>

        <tbody>
          {passengers.map((p) => {
            const passengerId = String(p.id);
            const seat = selectedSeats.find(s => s.passengerId === passengerId);

            return (
              <tr key={p.id} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '0.5rem 0' }}>
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
                </td>
                <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>
                  <strong>{seat?.seatLabel || t('seatMap.seatNotAssigned')}</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <button onClick={handleResetSeat} style={{ marginTop: '10px'}}>🔁 {t('seatMap.resetAll')}</button>
        </div>  
      </div>
    </div>
  );

};