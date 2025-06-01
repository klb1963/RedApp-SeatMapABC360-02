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
import { SelectedSeat } from '../SeatMapComponentBase';
import { PassengerOption } from '../../../utils/parsePnrData';

interface PassengerPanelProps {
  passengers: PassengerOption[];
  selectedSeats: SelectedSeat[];
  selectedPassengerId: string;
  setSelectedPassengerId: (id: string) => void;
  handleResetSeat: () => void;
  handleSave: () => void;
  handleDeleteSeats: () => void;
  handleAutomateSeating: () => void;
  saveDisabled: boolean;
  assignedSeats?: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[];
}

export const PassengerPanel: React.FC<PassengerPanelProps> = ({
  passengers,
  selectedSeats,
  selectedPassengerId,
  setSelectedPassengerId,
  handleResetSeat,
  handleSave,
  handleDeleteSeats,
  handleAutomateSeating,
  saveDisabled,
  assignedSeats = []
}) => {
  const totalPrice = selectedSeats.reduce((acc, s) => {
    const price = s.seat?.price || '0';
    const amount = parseFloat(price.replace(/[^\d.]/g, ''));
    return acc + (isNaN(amount) ? 0 : amount);
  }, 0);

  const hasAssignedSeats = selectedSeats.length > 0;

  return (
    <div style={{ padding: '1rem', minWidth: '320px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>Passengers: {passengers.length}</span>
        <span>Assigned seats: {selectedSeats.length}</span>
      </div>

      <div style={{ marginTop: '0.5rem', borderTop: '1px solid #ccc' }}>
        {passengers.map((pax) => {
          const paxId = String(pax.id);
          const assigned = selectedSeats.find(s => s.passengerId === paxId);
          return (
            <div
              key={paxId}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0', cursor: 'pointer' }}
              onClick={() => setSelectedPassengerId(paxId)}
            >
              <div>
                <input
                  type="radio"
                  name="selectedPassenger"
                  checked={selectedPassengerId === paxId}
                  onChange={() => setSelectedPassengerId(paxId)}
                />{' '}
                <strong>{pax.label}</strong>
              </div>
              <div>
                {assigned ? (
                  <span style={{ color: pax.passengerColor || 'gray', fontWeight: 600 }}>{assigned.seatLabel}</span>
                ) : (
                  <span style={{ color: 'gray' }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 'bold' }}>
        Total: USD {totalPrice.toFixed(2)}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        {assignedSeats.length > 0 ? (
          <button
            onClick={handleDeleteSeats}
            style={{
              border: '1px solid #000',
              color: '#000',
              backgroundColor: '#fff',
              padding: '0.5rem 1.2rem',
              fontWeight: 500,
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            DELETE SEATS
          </button>
        ) : (
          <>
          
            <button
              onClick={handleAutomateSeating}
              style={{
                backgroundColor: '#212121', 
                color: '#fff',
                padding: '0.5rem 1.2rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ABC 360
            </button>

            <button onClick={handleResetSeat} className="btn btn-outline-secondary">
              RESET ALL
            </button>

            <button
              onClick={handleSave}
              disabled={saveDisabled}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                padding: '0.5rem 1.2rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                opacity: saveDisabled ? 0.5 : 1,
              }}
            >
              SAVE
            </button>
          </>
        )}
      </div>
    </div>
  );
};