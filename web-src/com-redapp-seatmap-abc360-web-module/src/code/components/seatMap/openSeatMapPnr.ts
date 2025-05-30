// file: /code/components/seatMap/openSeatMapPnr.ts

/**
 * Opens the Seat Map modal for PNR context.
 * Loads PNR data, fetches seat availability from Sabre,
 * maps passenger/segment data, and initializes the SeatMapComponentPnr.
 */

import * as React from 'react';
import { getService } from '../../Context';
import { PublicModalsService } from 'sabre-ngv-modals/services/PublicModalService';
import { loadPnrDetailsFromSabre } from '../../services/loadPnrDetailsFromSabre';
import { loadSeatMapFromSabre } from '../../services/loadSeatMapFromSabre';
import SeatMapComponentPnr from './SeatMapComponentPnr';
import { quicketConfig } from '../../utils/quicketConfig';
import { t } from '../../Context';
import { enrichPassengerData } from '../seatMap/utils/enrichPassengerData';

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

    const { enrichedPassengers, assignedSeats } = enrichPassengerData(pnrData.passengers || []);

    const selectedSegmentIndex = 0;
    const activeFlight = flightSegments[selectedSegmentIndex];

    const { availability } = await loadSeatMapFromSabre(activeFlight, enrichedPassengers);

    modals.showReactModal({
      header: 'Seat Map ABC 360',
      component: React.createElement(SeatMapComponentPnr, {
        config: quicketConfig,
        flightSegments,
        selectedSegmentIndex,
        availability,
        passengers: enrichedPassengers,
        assignedSeats,
        onSeatChange: (updatedSeats) => {
          selectedSeatsRef.current = updatedSeats;
        }
      }),
      modalClassName: 'seatmap-modal-lower'
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