// file: /code/components/seatMap/openSeatMapPnr.ts

/**
 * 📍 openSeatMapPnr.ts
 *
 * Opens the Seat Map modal in the context of an existing PNR.
 * - Loads PNR data and parses passenger and segment details
 * - Fetches availability for the first segment via EnhancedSeatMapRS
 * - Displays SeatMapComponentPnr with mapped props and data bindings
 * 
 * Used as the entry point for viewing/editing seats from a retrieved PNR.
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
    // Load current PNR with passengers and segments
    const { parsedData: pnrData } = await loadPnrDetailsFromSabre();

    if (!pnrData || !pnrData.segments?.length) {
      // Show fallback modal if no segments present
      modals.showReactModal({
        header: 'Seat Map ABC 360',
        component: React.createElement('div', { style: { padding: '1rem' } }, t('seatMap.noSegments')),
        modalClassName: 'seatmap-modal-class'
      });
      return;
    }

    // Normalize flight segments to match seat map library expectations
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

    // Enrich passenger data with visuals and assignments
    const { enrichedPassengers, assignedSeats } = enrichPassengerData(pnrData.passengers || []);

    // Focus on first segment
    const selectedSegmentIndex = 0;
    const activeFlight = flightSegments[selectedSegmentIndex];

    // Load availability for this segment
    const { availability } = await loadSeatMapFromSabre(activeFlight, enrichedPassengers);

    // Show seat map modal with loaded data
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