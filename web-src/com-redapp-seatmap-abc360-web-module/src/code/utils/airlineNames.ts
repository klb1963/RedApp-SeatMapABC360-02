/**
 * airlineNames
 * 
 * 🏷️ Mapping of airline IATA codes to full airline names.
 *
 * Used for displaying human-readable airline names in the SeatMap UI,
 * flight info panel, tooltips, or reports.
 *
 * Extend this map as needed for additional carriers.
 */

export const airlineNames: Record<string, string> = {
    LH: 'Lufthansa',
    AF: 'Air France',
    KL: 'KLM Royal Dutch Airlines',
    BA: 'British Airways',
    LX: 'SWISS',
    OS: 'Austrian Airlines',
    TK: 'Turkish Airlines',
    AZ: 'ITA Airways',
    DL: 'Delta Air Lines',
    AA: 'American Airlines',
    UA: 'United Airlines',
    // add others when need
  };