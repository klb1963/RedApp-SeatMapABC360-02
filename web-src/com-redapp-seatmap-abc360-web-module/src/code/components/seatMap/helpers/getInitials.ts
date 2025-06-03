// file: src/code/seatMap/helpers/getInitials.ts

import { PassengerOption } from '../../../utils/parsePnrData';

/**
 * Returns passenger initials based on given name and surname.
 */
export const getInitials = (p: PassengerOption): string => {
  const first = p.givenName?.trim().charAt(0).toUpperCase() || ''; // get first letter from givenName, then toUpperCase
  const last = p.surname?.trim().charAt(0).toUpperCase() || ''; // get first letter from surName, then toUpperCase
  return `${first}${last}`; // John Smith => JS 
};
