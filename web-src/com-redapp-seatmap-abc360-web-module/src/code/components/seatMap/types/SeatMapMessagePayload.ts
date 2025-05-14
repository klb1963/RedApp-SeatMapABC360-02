// file: code/components/seatMap/types/SeatMapMessagePayload.ts
export interface SeatMapMessagePayload {
    type: string;
    config: string;
    flight: string;
    availability: string;
    passengers: string;
    currentDeckIndex: string;
  }