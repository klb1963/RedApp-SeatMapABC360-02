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
  x: number;
  y: number;
}

interface Row {
  label: string;
  seats: Seat[];
}

interface Deck {
  id: string;
  name: string;
  rows: Row[];
}

type SeatType = 'available' | 'occupied' | 'paid' | 'blocked' | 'preferred' | 'unavailable';

export interface AvailabilityItem {
  label: string;
  seatLabel: string;
  price: number;
  currency: string;
  color: string;
  type: SeatType;
}

function getSeatType(seatEl: Element): SeatType {
  const occupiedInd = seatEl.getAttribute('occupiedInd') === 'true';
  const availableInd = seatEl.getAttribute('availableInd') === 'true';
  // 🔒 Not bookable — если есть Limited Detail с code="1" (RestrictedGeneral)
  const isRestricted = Array.from(seatEl.querySelectorAll('Limitations > Detail'))
    .some(detail => detail.getAttribute('code') === '1');

  const occupationDetails = Array.from(seatEl.querySelectorAll('Occupation > Detail'))
    .map((d) => d.textContent?.trim());

  const isOccupied = occupiedInd || occupationDetails.includes('SeatIsOccupied');
  const isFree = occupationDetails.includes('SeatIsFree');

  const isPreferred = Array.from(seatEl.querySelectorAll('Facilities > Detail'))
    .some(detail => detail.getAttribute('code') === 'O');

  const offerTotalAmountEl = seatEl.querySelector('Offer TotalAmount');
  const price = offerTotalAmountEl ? parseFloat(offerTotalAmountEl.textContent || '0') : 0;

  // Правила классификации
  if (isOccupied) return 'occupied';
  if (isRestricted && isFree && !occupiedInd) return 'unavailable';
  if (!availableInd && !isFree) return 'blocked';
  if (price > 0 && isPreferred) return 'preferred';
  if (price > 0) return 'paid';
  if (isPreferred) return 'preferred';

  return 'available';
}

function getColorByType(type: SeatType): string {
  switch (type) {
    case 'available': return '#00C853'; // green
    case 'paid': return '#F8CF00'; // yellow
    case 'occupied': return '#212121'; // dark grey
    case 'unavailable': return '#212121'; // dark grey
    case 'blocked': return 'lightgray'; 
    case 'preferred': return '#01D0CE'; // light blue
    default: return 'white';
  }
}

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

      const priceEl = seatEl.querySelector('Offer TotalAmount');
      const price = priceEl ? parseFloat(priceEl.textContent || '0') : 0;
      const currency = priceEl?.getAttribute('currencyCode') || 'USD';

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