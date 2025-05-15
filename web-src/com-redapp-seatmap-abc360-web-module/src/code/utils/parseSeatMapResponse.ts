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

/**
 * === Interfaces for layout and seat positions ===
 */

interface Seat {
  label: string;
  x: number; // ⬅️ X-coordinate for layout rendering
  y: number; // ⬇️ Y-coordinate for layout rendering
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

/**
 * === Interface for availability & pricing ===
 */
interface AvailabilityItem {
  label: string;     // e.g. '12A'
  price: number;     // Numeric price
  currency: string;  // e.g. 'USD'
  color: string;     // Used for coloring seats (e.g. orange, gray)
}

/**
 * Determines the seat color based on Sabre attributes
 * - gray: occupied
 * - orange: seat has an offer/price
 * - lightblue: free seat
 */
function getSeatColor(seatEl: Element): string {
  const isOccupied = seatEl.getAttribute('occupiedInd') === 'true';
  const hasOffer = seatEl.querySelector('Offer');
  if (isOccupied) return 'gray';
  if (hasOffer) return 'orange';
  return 'lightblue';
}

/**
 * Parses EnhancedSeatMapRS XML and extracts both layout and pricing/availability.
 *
 * @param xml - Parsed XMLDocument from Sabre seat map response
 * @returns Object with { layout, availability }
 */
export function parseSeatMapResponse(xml: Document): {
  layout: { decks: Deck[] };
  availability: AvailabilityItem[];
} {
  const layout: { decks: Deck[] } = {
    decks: [{ id: 'main-deck', name: 'Main Deck', rows: [] }]
  };
  const availability: AvailabilityItem[] = [];

  // 🔍 Find all <Row> elements
  const rowElements = Array.from(xml.querySelectorAll('Row'));

  rowElements.forEach((rowEl, rowIndex) => {
    const rowNumber = rowEl.querySelector('RowNumber')?.textContent?.trim() || '';
    if (!/^\d+$/.test(rowNumber)) return; // Skip invalid rows

    const row: Row = { label: rowNumber, seats: [] };
    const seatElements = Array.from(rowEl.querySelectorAll('Seat'));

    seatElements.forEach((seatEl, seatIndex) => {
      const seatLabel = seatEl.querySelector('Number')?.textContent?.trim();
      if (!seatLabel) return;

      // 💰 Offer price
      const offerEl = seatEl.querySelector('Offer TotalAmount');
      const price = offerEl ? parseFloat(offerEl.textContent || '0') : 0;
      const currency = offerEl?.getAttribute('currencyCode') || 'USD';
      const color = getSeatColor(seatEl);

      // 📦 Add seat info to availability array
      availability.push({
        label: `${rowNumber}${seatLabel}`,
        price,
        currency,
        color
      });

      // 🪑 Add seat to layout
      row.seats.push({
        label: seatLabel,
        x: 60 + seatIndex * 60, // simple horizontal spacing
        y: 50 + rowIndex * 40   // simple vertical spacing
      });
    });

    layout.decks[0].rows.push(row);
  });

  // 🔢 Sort rows numerically by row number
  layout.decks[0].rows.sort((a, b) => parseInt(a.label) - parseInt(b.label));

  return { layout, availability };
}