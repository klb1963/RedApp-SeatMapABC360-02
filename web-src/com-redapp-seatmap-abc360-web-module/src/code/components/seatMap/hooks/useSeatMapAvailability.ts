// file: /code/components/seatMap/hooks/useSeatMapAvailability.ts

/**
 * useSeatMapAvailability.ts
 *
 * React hook that encapsulates the logic for loading seat map availability,
 * generating flight metadata, and enriching assigned seats for a given segment.
 *
 * Responsibilities:
 * - Fetch seat map availability from Sabre for the given segment & passengers
 * - Generate flightData required for rendering the seat map
 * - Enrich assigned seats into SelectedSeat objects
 * - Maintain selected and allSelectedSeats state
 */

import { useEffect, useState } from 'react';
import { generateFlightData } from '../../../utils/generateFlightData';
import { mapCabinToCode } from '../../../utils/mapCabinToCode';
import { createSelectedSeat } from '../helpers/createSelectedSeat';
import { SelectedSeat } from '../types/types';

interface UseSeatMapAvailabilityParams {
  segment: any;                  // currently selected flight segment
  segmentIndex: number;          // index of the selected segment
  cabinClass: string;            // cabin class (Y, C, F, etc.)
  passengers: any[];             // list of passengers
  assignedSeats: {
    passengerId: string;
    seat: string;
    segmentNumber: string;
  }[];
}

export function useSeatMapAvailability({
  segment,
  segmentIndex,
  cabinClass,
  passengers,
  assignedSeats,
}: UseSeatMapAvailabilityParams) {
  const [availabilityReady, setAvailabilityReady] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState<any[]>([]);
  const [flightData, setFlightData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [allSelectedSeats, setAllSelectedSeats] = useState<SelectedSeat[]>([]);

  /**
   * Effect: Fetch availability & prepare seat map data when segment or cabin changes
   */
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!segment) return;

      // Reset state while fetching
      setAvailabilityReady(false);
      setSelectedSeats([]);
      setFlightData(null);

      try {
        // Load seat map availability from Sabre service
        const { availability } = await import('../../../services/loadSeatMapFromSabre')
          .then(mod => mod.loadSeatMapFromSabre(segment, passengers));

        setCurrentAvailability(availability);
        setAvailabilityReady(true);

        // Find availability data specific to the current segment
        const currentSegment = availability?.find(
          a => String(a.segmentNumber) === String(segment.sequence)
        );

        // Generate metadata needed for the seat map renderer
        const generatedFlightData = generateFlightData(
          segment,
          segmentIndex,
          mapCabinToCode(cabinClass),
          currentSegment?.startRow,
          currentSegment?.endRow
        );

        setFlightData(generatedFlightData);

        // Enrich assigned seats for the current segment into SelectedSeat objects
        if (assignedSeats?.length) {
          const enrichedAssignedSeats = assignedSeats
            .filter(s => String(s.segmentNumber) === String(segment.sequence))
            .map(s => {
              const pax = passengers.find(
                p => String(p.id) === String(s.passengerId) || String(p.nameNumber) === String(s.passengerId)
              );
              if (!pax) return null;

              return createSelectedSeat(
                pax,
                s.seat,
                true,
                availability,
                String(segment.sequence)
              );
            })
            .filter(Boolean);

          setSelectedSeats(enrichedAssignedSeats);

          // Replace seats for current segment in allSelectedSeats
          setAllSelectedSeats(prev => {
            const others = prev.filter(seat => seat.segmentNumber !== String(segment.sequence));
            return [...others, ...enrichedAssignedSeats];
          });
        }

      } catch (err) {
        console.error('Failed to load seat map for segment', segment.sequence, err);
        setCurrentAvailability(null);
        setAvailabilityReady(false);
      }
    };

    fetchAvailability();
  }, [segment?.sequence, cabinClass]); // ✅ only primitive dependencies to prevent infinite loop

  return {
    availabilityReady,       // whether availability is loaded and ready
    currentAvailability,     // current seat map availability data
    flightData,              // metadata for seat map renderer
    selectedSeats,           // seats selected for the current segment
    setSelectedSeats,        // setter for current segment seats
    allSelectedSeats,        // all seats selected across all segments
    setAllSelectedSeats,     // setter for allSelectedSeats
  };
}