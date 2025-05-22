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
import { t } from '../../Context';

export async function openSeatMapPnr(): Promise<void> {
  const modals = getService(PublicModalsService);
  const selectedSeatsRef = { current: [] };

  try {
    const { parsedData: pnrData } = await loadPnrDetailsFromSabre();

    if (!pnrData || !pnrData.segments?.length) {
      modals.showReactModal({
        header: 'Seat Map ABC 360',
        component: React.createElement('div', { style: { padding: '1rem' } }, t('seatMap.noSegments')),
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
      id: p.value,
      value: p.value,
      nameNumber: p.nameNumber
    }));

    const selectedSegmentIndex = 0;
    const activeFlight = flightSegments[selectedSegmentIndex];

    const { availability } = await loadSeatMapFromSabre(activeFlight, passengers);

    const onClickCancel = () => modals.closeReactModal();

    const handleSubmit = async () => {
      const selected = selectedSeatsRef.current;

      if (!selected?.length) {
        alert('❗ Не выбрано ни одного места.');
        return;
      }

      await handleSaveSeats(selected);
    };

    modals.showReactModal({
      header: 'Seat Map ABC 360',
      component: React.createElement(SeatMapComponentPnr, {
        config: quicketConfig,
        flightSegments,
        selectedSegmentIndex,
        availability,
        passengers: mappedPassengers,
        onSeatChange: (updatedSeats) => {
          selectedSeatsRef.current = updatedSeats;
        }
      }),
      onSubmit: handleSubmit,
      actions: actions(handleSubmit, onClickCancel),
      modalClassName: 'seatmap-modal-wide'
    });

  } catch (error) {
    console.error('❌ Failed to load SeatMap from PNR:', error);

    modals.showReactModal({
      header: 'SeatMap Error',
      component: React.createElement('div', { style: { padding: '1rem', color: 'red' } }, t('seatMap.loadPnrError')),
      modalClassName: 'seatmap-modal-class'
    });
  }
}