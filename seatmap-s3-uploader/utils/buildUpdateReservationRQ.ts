// file: utils/buildUpdateReservationRQ.ts

interface SeatAssignment {
    seat: string;
    nameNumber: string; // Format: "1.1", "2.1", etc.
  }
  
  /**
   * Builds a SOAP UpdateReservationRQ payload to assign seats to passengers.
   *
   * @param seatAssignments - Array of seat assignments with seat number and nameNumber
   * @returns XML payload string for UpdateReservationRQ
   */
  export function buildUpdateReservationRQ(seatAssignments: SeatAssignment[]): string {
    const seatUpdatesXml = seatAssignments.map(({ seat, nameNumber }) => `
      <SeatUpdate>
        <Seat>${seat}</Seat>
        <NameNumber>${nameNumber}</NameNumber>
      </SeatUpdate>
    `).join('\n');
  
    return `<?xml version="1.0" encoding="UTF-8"?>
  <UpdateReservationRQ xmlns="http://webservices.sabre.com/pnrbuilder/v1_19" Version="1.19.0">
    <RequestType>Stateful</RequestType>
    <Operation>Update</Operation>
    <ReservationUpdate>
      <SeatUpdateRQ>
  ${seatUpdatesXml}
      </SeatUpdateRQ>
    </ReservationUpdate>
  </UpdateReservationRQ>`;
  }