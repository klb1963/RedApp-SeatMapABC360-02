// file: /code/utils/parseSeatMapResponse.ts

/**
 * parseSeatMapResponse.ts
 *
 * 📦 Parser for EnhancedSeatMapRS XML response from Sabre.
 *
 * Extracts:
 *  - layout: structured rows and seats for seat map display
 *  - availability: seat pricing and availability metadata
 *
 * Used to prepare data for the seat map visualization library.
 */

interface Seat {
  label: string;
  x: number; // X-coordinate for layout rendering
  y: number; // Y-coordinate for layout rendering
}

interface Row {
  label: string;   // Row number
  seats: Seat[];   // Seats in the row
}

interface Deck {
  id: string;      // e.g. 'main-deck'
  name: string;    // Display label
  rows: Row[];     // List of rows (with seats)
}

type SeatType = 'available' | 'occupied' | 'paid' | 'blocked' | 'preferred';

interface AvailabilityItem {
  label: string;     // e.g. '12A'
  seatLabel: string; // for usage in createSelectedSeat
  price: number;     // Numeric price
  currency: string;  // e.g. 'USD'
  color: string;     // Used for seat rendering
  type: SeatType;    // Semantic type for legend/logic
}

/**
 * Maps Sabre seat attributes to a semantic seat type.
 */
function getSeatType(seatEl: Element): SeatType {
  const isOccupied = seatEl.getAttribute('occupiedInd') === 'true';
  const isBlocked = seatEl.getAttribute('availableInd') === 'false';
  const offerEl = seatEl.querySelector('Offer TotalAmount');
  const price = offerEl ? parseFloat(offerEl.textContent || '0') : 0;

  const isPreferred = Array.from(seatEl.querySelectorAll('Facilities > Detail'))
    .some(detail => detail.getAttribute('code') === 'O');

  if (isOccupied) return 'occupied';
  if (isBlocked) return 'blocked';
  if (isPreferred) return 'preferred';
  if (offerEl && price > 0) return 'paid';

  return 'available';
}

/**
 * Maps seat type to color (used in UI rendering).
 */
function getColorByType(type: SeatType): string {
  switch (type) {
    case 'available': return '#0B8A10'; // #0B8A10 #A6ECA6 
    case 'paid': return '#F4B400'; // olive #A2A233 #F4B400
    case 'occupied': return '#5f5e5e'; // dark gray #5F5E5E
    case 'blocked': return 'lightgray';
    case 'preferred': return '#01D0CE'; // light blue #01D0CE'
    default: return 'white';
  }
}

/**
 * Parses EnhancedSeatMapRS XML and extracts both layout and pricing/availability.
 */
export function parseSeatMapResponse(xml: Document): {
  layout: { decks: Deck[] };
  availability: AvailabilityItem[];
} {
  const layout: { decks: Deck[] } = {
    decks: [{ id: 'main-deck', name: 'Main Deck', rows: [] }]
  };
  const availability: AvailabilityItem[] = [];

  const rowElements = Array.from(xml.querySelectorAll('Row'));

  rowElements.forEach((rowEl, rowIndex) => {
    const rowNumber = rowEl.querySelector('RowNumber')?.textContent?.trim() || '';
    if (!/^\d+$/.test(rowNumber)) return;

    const row: Row = { label: rowNumber, seats: [] };
    const seatElements = Array.from(rowEl.querySelectorAll('Seat'));

    seatElements.forEach((seatEl, seatIndex) => {
      const seatLabel = seatEl.querySelector('Number')?.textContent?.trim();
      if (!seatLabel) return;

      const offerEl = seatEl.querySelector('Offer TotalAmount');
      const price = offerEl ? parseFloat(offerEl.textContent || '0') : 0;
      const currency = offerEl?.getAttribute('currencyCode') || 'USD';

      const type = getSeatType(seatEl);
      const color = getColorByType(type);

      availability.push({
        label: `${rowNumber}${seatLabel}`,
        seatLabel: `${rowNumber}${seatLabel}`,
        price,
        currency,
        color,
        type
      });

      row.seats.push({
        label: seatLabel,
        x: 60 + seatIndex * 60,
        y: 50 + rowIndex * 40
      });
    });

    layout.decks[0].rows.push(row);
  });

  layout.decks[0].rows.sort((a, b) => parseInt(a.label) - parseInt(b.label));

  return { layout, availability };
  
}
