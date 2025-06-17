// ✅ file: /code/utils/parseSeatMapResponse.ts

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

import { extractSeatLayoutFromXml } from '../utils/extractSeatLayoutFromXml';

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

export interface SeatInfo {
  seatNumber: string;
  seatStatus: string;
  seatPrice?: number;
  seatCharacteristics?: string[];
}

function getSeatType(seatEl: Element): SeatType {
  const occupiedInd = seatEl.getAttribute('occupiedInd') === 'true';
  const availableInd = seatEl.getAttribute('availableInd') === 'true';

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
    case 'available': return '#00C853'; // #00C853
    case 'paid': return '#F8CF00'; // #F8CF00
    case 'occupied': return '#212121'; // #212121
    case 'unavailable': return '#212121'; // #212121
    case 'blocked': return 'lightgray'; // 
    case 'preferred': return '#01D0CE'; // #01D0CE
    default: return 'white';
  }
}

export function parseSeatMapResponse(xml: Document): {
  layout: { decks: Deck[] };
  availability: AvailabilityItem[];
  seatInfo: SeatInfo[];
  layoutLetters: string[]; // 🆕 добавлен для использования при вставке проходов
} {
  const layout: { decks: Deck[] } = {
    decks: [{ id: 'main-deck', name: 'Main Deck', rows: [] }]
  };
  const availability: AvailabilityItem[] = [];
  const seatInfo: SeatInfo[] = [];
  const layoutLetters = extractSeatLayoutFromXml(xml);

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
      const seatNumber = `${rowNumber}${seatLabel}`;

      const allowedTypes: SeatType[] = ['available', 'paid', 'preferred'];
      if (allowedTypes.includes(type)) {
        availability.push({
          label: seatNumber,
          seatLabel: seatNumber,
          price,
          currency,
          color,
          type
        });
      }

      const rawCodes = Array.from(seatEl.querySelectorAll('RawSeatCharacteristics > Code'))
        .map((codeEl) => codeEl.textContent?.trim())
        .filter(Boolean) as string[];

      const locationCodes = Array.from(seatEl.querySelectorAll('Location > Detail'))
        .map((detailEl) => detailEl.getAttribute('code'))
        .filter(Boolean) as string[];

      const allCodes = Array.from(new Set([...rawCodes, ...locationCodes]));

      seatInfo.push({
        seatNumber,
        seatStatus: type,
        seatPrice: price,
        seatCharacteristics: allCodes
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

  return { 
    layout, 
    availability, 
    seatInfo, 
    layoutLetters
  };
}