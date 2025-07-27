/**
 * Common types used in the SeatMap ABC360 project.
 *
 * - `CabinClass`: possible cabin class codes for a flight segment
 * - `PassengerOption`: metadata for each passenger displayed in the UI
 * - `SelectedSeat`: temporary seat assignment object used during interaction
 * - `AssignedSeat`: confirmed seat assignment, usually coming from PNR
 */

/**
 * Cabin class codes used to filter seat maps.
 * - 'Y' = Economy
 * - 'S' = Premium Economy
 * - 'C' = Business
 * - 'F' = First
 * - 'A' = All cabins (fallback mode)
 */
export type CabinClass = 'Y' | 'S' | 'C' | 'F' | 'A';

/**
 * Passenger metadata for display and seat assignment.
 */
export interface PassengerOption {
  id: string; // usually nameNumber (e.g., "01.01")
  value: string; // same as id
  givenName: string;
  surname: string;
  label: string; // formatted label shown in UI
  passengerInitials: string; // used inside the seat circle
  passengerColor?: string; // color assigned for this passenger
}

/**
 * Temporary seat selection for a passenger.
 * Used during interactive seat selection before saving.
 */
export interface SelectedSeat {
  passengerId: string;
  seatLabel: string;
  passengerType: string;
  passengerLabel: string;
  initials: string;
  passengerInitials: string;
  passengerColor: string;
  segmentNumber: string;
  seat: {
    seatLabel: string;
    price: string;
  };
  readOnly?: boolean;
  abbr?: string;
}

/**
 * Confirmed seat assignment retrieved from Sabre PNR.
 * Typically used when pre-filled seat data exists.
 */
export interface AssignedSeat {
  passengerId: string;
  seatLabel: string;
  confirmed: boolean;
  price: number;
  passengerInitials: string;
  passengerColor?: string;
  segmentNumber: string; // usually derived from segment.Consequence
}
