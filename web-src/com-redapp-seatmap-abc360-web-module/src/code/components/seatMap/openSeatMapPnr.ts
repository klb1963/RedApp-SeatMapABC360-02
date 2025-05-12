import * as React from 'react';
import { getService } from '../../Context';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { loadSeatMapFromSabre } from '../../services/loadSeatMapFromSabre';
import { handleSaveSeats } from './handleSaveSeats';
import { actions } from './actions';
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
    const mappedPassengers = passengers.map((p, i) => ({
        ...p,
        id: `${i}`
      }));

    const selectedSegmentIndex = 0;
    const activeFlight = flightSegments[selectedSegmentIndex];

    const { availability } = await loadSeatMapFromSabre(activeFlight, passengers);

    const onClickCancel = () => modals.closeReactModal();

    modals.showReactModal({
      header: 'Seat Map ABC 360',

      component: React.createElement(SeatMapComponentPnr, {
        config: quicketConfig,
        flightSegments,
        selectedSegmentIndex,
        availability,
        passengers: mappedPassengers
      }),
      onSubmit: () => handleSaveSeats(store.getState().selectedSeats),
      actions: actions(() => handleSaveSeats(store.getState().selectedSeats), onClickCancel),
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