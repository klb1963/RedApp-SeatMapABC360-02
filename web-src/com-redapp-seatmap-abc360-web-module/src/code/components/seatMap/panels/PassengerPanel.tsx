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
import { t } from '../../../Context';
import { SelectedSeat } from '../SeatMapComponentBase';
import { PassengerOption } from '../../../utils/parsePnrData';
import { postSeatMapUpdate } from '../helpers/postSeatMapUpdate';
import { createPassengerPayload } from '../helpers/createPassengerPayload';
import { handleReassignSeat } from '../handleReassignSeats';

export interface PassengerPanelProps {
  passengers: PassengerOption[];
  selectedSeats: SelectedSeat[];
  selectedPassengerId: string;
  setSelectedPassengerId: (id: string) => void;
  handleResetSeat: () => void;
  handleSave: () => void;
  handleAutomateSeating: () => void;
  setSelectedSeats: (seats: SelectedSeat[]) => void;
  saveDisabled: boolean;
  assignedSeats?: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[];
  config?: any;
  flight?: any;
  availability?: any;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

export const PassengerPanel: React.FC<PassengerPanelProps> = ({
  passengers,
  selectedSeats,
  selectedPassengerId,
  setSelectedPassengerId,
  handleResetSeat,
  handleSave,
  handleAutomateSeating,
  saveDisabled,
  setSelectedSeats,
  assignedSeats = [],
  config,
  flight,
  availability,
  iframeRef
}) => {
  function getPriceForSeat(seatLabel: string): number {
    if (!availability) return 0;
    const found = availability.find((seat: any) => seat.label === seatLabel);
    if (found?.price != null) {
      const amount = parseFloat(
        (typeof found.price === 'string' ? found.price : String(found.price)).replace(/[^\d.]/g, '')
      );
      return isNaN(amount) ? 0 : amount;
    }
    return 0;
  }

  const totalPrice = selectedSeats.reduce((acc, s) => {
    const directPrice = parseFloat(String(s.seat?.price)) || 0;
    const fallbackPrice = getPriceForSeat(s.seatLabel);
    return acc + (directPrice > 0 ? directPrice : fallbackPrice);
  }, 0);

  const onRemoveSeat = (passengerIdToRemove: string) => {
    handleReassignSeat({
      passengerId: passengerIdToRemove,
      selectedSeats,
      setSelectedSeats,
      setSelectedPassengerId
    });

    if (iframeRef?.current && config && flight) {
      postSeatMapUpdate({
        config,
        flight,
        availability,
        passengers,
        selectedSeats: selectedSeats.filter(s => s.passengerId !== passengerIdToRemove),
        selectedPassengerId: passengerIdToRemove,
        iframeRef
      });
    }
  };

  const allSeated = passengers.every(p => selectedSeats.some(s => s.passengerId === p.id));

  const [reassignMode, setReassignMode] = React.useState(false);

  React.useEffect(() => {
    const allReassigned = passengers.every(p =>
      selectedSeats.some(s => s.passengerId === p.id)
    );
    if (allReassigned) {
      setReassignMode(false);
    }
  }, [selectedSeats, passengers]);

  return (
    <div style={{ padding: '1rem', minWidth: '320px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>{t('seatMap.passengers')}: {passengers.length}</span>
        <span>{t('seatMap.assignedSeats')}: {selectedSeats.length}</span>
      </div>

      <div style={{ marginTop: '0.5rem', borderTop: '1px solid #ccc' }}>
        {passengers.map((pax) => {
          const paxId = String(pax.id);
          const assigned = selectedSeats.find(s => s.passengerId === paxId);
          return (
            <div
              key={paxId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.25rem 0',
                cursor: 'pointer',
              }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {assigned ? (
                  <>
                    <span style={{ color: pax.passengerColor || 'gray', fontWeight: 600 }}>
                      {assigned.seatLabel}
                    </span>
                    {reassignMode && pax.nameNumber && paxId === selectedPassengerId && (
                      <button
                        title={t('seatMap.button.cancelSeat')}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSeat(paxId);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#a00',
                          cursor: 'pointer',
                          fontSize: '1rem',
                        }}
                      >
                        ❌
                      </button>
                    )}
                  </>
                ) : (
                  <span style={{ color: 'gray' }}>{t('seatMap.seatNotAssigned')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'right', marginTop: '1rem', fontWeight: 'bold' }}>
        {t('seatMap.total')}: USD {totalPrice.toFixed(2)}
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        {selectedSeats.length > 0 && (
          <button
            onClick={() => {
              setReassignMode(true);
            }}
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
            {t('seatMap.button.reassign')}
          </button>
        )}

        {selectedSeats.length === 0 && (
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
            {t('seatMap.button.autoAssign')}
          </button>
        )}

        <button
          onClick={handleResetSeat}
          disabled={selectedSeats.length === 0}
          className="btn btn-outline-secondary"
        >
          {t('seatMap.resetAll')}
        </button>

        <button
          onClick={handleSave}
          disabled={!allSeated}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            padding: '0.5rem 1.2rem',
            fontWeight: 600,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            opacity: !allSeated ? 0.5 : 1,
          }}
        >
          {t('seatMap.button.save')}
        </button>
      </div>
    </div>
  );
};
