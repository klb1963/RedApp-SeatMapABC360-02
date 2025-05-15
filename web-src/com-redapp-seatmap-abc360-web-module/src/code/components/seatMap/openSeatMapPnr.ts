// file: /code/components/seatMap/openSeatMapPnr.ts

/**
 * Opens the Seat Map modal for PNR context.
 * Loads PNR data, fetches seat availability from Sabre,
 * maps passenger/segment data, and initializes the SeatMapComponentPnr.
 *
 * Triggered by UI events (e.g., button click or tile).
 */

import * as React from 'react';
import { getService } from '../../Context';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { loadSeatMapFromSabre } from '../../services/loadSeatMapFromSabre';
import { handleSaveSeats } from './handleSaveSeats';
import { actions } from './panels/actions';
import SeatMapComponentPnr from './SeatMapComponentPnr';
import { quicketConfig } from '../../utils/quicketConfig';

export async function openSeatMapPnr(store: any): Promise<void> {
  const modals = getService(PublicModalsService);

  try {
    const { parsedData: pnrData } = await loadPnrDetailsFromSabre();

    if (!pnrData || !pnrData.segments?.length) {
      modals.showReactModal({
        header: 'Seat Map ABC 360',
        component: React.createElement('div', { style: { padding: '1rem' } }, 'No active PNR with flight segments.'),
        modalClassName: 'seatmap-modal-class'
      });
      return;
    }

    const flightSegments = pnrData.segments.map(seg => ({
      ...seg,
      flightNo: seg.marketingFlightNumber || '000',
      flightNumber: seg.marketingFlightNumber || '000',
      airlineCode: seg.marketingCarrier || 'XX',
      origin: seg.origin || 'XXX',
      destination: seg.destination || 'YYY',
      departureDate: seg.departureDate || '2025-01-01',
      cabinClass: seg.bookingClass || 'Y',
      equipment: seg.equipment || 'unknown',
      passengerType: 'ADT'
    }));

    const passengers = pnrData.passengers || [];
    const mappedPassengers = passengers.map((p) => ({
      ...p,
      id: p.value,             // 🔑 unique ID (например, "2")
      value: p.value,          // 🔁 for compability with UI-components
      nameNumber: p.nameNumber      // ✅ NameNumber, example "2.1"
    }));

    const selectedSegmentIndex = 0;
    const activeFlight = flightSegments[selectedSegmentIndex];

    const { availability } = await loadSeatMapFromSabre(activeFlight, passengers);

    const onClickCancel = () => modals.closeReactModal();


    // 🆕 ENRICH before sending
    const handleSubmit = () => {
        const selected = store.getState().selectedSeats || [];
        const enriched = selected.map(seat => {
          const pax = mappedPassengers.find(p => p.id === seat.passengerId);
          return {
            nameNumber: pax?.nameNumber || '',
            seatLabel: seat.seatLabel,
            segmentNumber: activeFlight?.value || '1' // ⚠️ значение ID сегмента
          };
        });
        return handleSaveSeats(); // убрал аргумент
      };

    modals.showReactModal({
      header: 'Seat Map ABC 360',

      component: React.createElement(SeatMapComponentPnr, {
        config: quicketConfig,
        flightSegments,
        selectedSegmentIndex,
        availability,
        passengers: mappedPassengers
      }),
      onSubmit: handleSubmit,
      actions: actions(handleSubmit, onClickCancel),
      modalClassName: 'seatmap-modal-wide'
    });

  } catch (error) {
    console.error('❌ Failed to load SeatMap from PNR:', error);

    modals.showReactModal({
      header: 'SeatMap Error',
      component: React.createElement('div', { style: { padding: '1rem', color: 'red' } }, 'Failed to load PNR data.'),
      modalClassName: 'seatmap-modal-class'
    });
  }
}