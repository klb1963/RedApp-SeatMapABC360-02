export type CabinClass = 'Y' | 'S' | 'C' | 'F' | 'A';

export interface PassengerOption {
  id: string;
  value: string;
  givenName: string;
  surname: string;
  label: string;
  passengerInitials: string;
  passengerColor?: string;
}

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
}

export interface AssignedSeat {
  passengerId: string;
  seatLabel: string;
  confirmed: boolean;
  price: number;
  passengerInitials: string;
  passengerColor?: string;
  segmentNumber: string;
}