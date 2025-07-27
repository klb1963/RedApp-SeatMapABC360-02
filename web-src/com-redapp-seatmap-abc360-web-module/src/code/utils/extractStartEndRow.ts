// file: src/code/utils/extractStartEndRow.ts

/**
 * ✈️ extractStartAndEndRowFromCabin
 *
 * Extracts the first and last meaningful seat rows from the EnhancedSeatMapRS XML response.
 * Combines row numbers with seat letters to build Quicket-compatible format: `${rowNumber}:${seatLetters}`
 * 
 * This is used to inform seat map renderers which part of the aircraft to display.
 *
 * @param xmlDoc Parsed XML Document from EnhancedSeatMapRS
 * @returns Object with startRow and endRow, e.g. { startRow: '6:ABCDEF', endRow: '38:ACDF' }
 */

export function extractStartAndEndRowFromCabin(
  xmlDoc: Document
): { startRow?: string; endRow?: string } {
  // 🔍 Get all <Cabin> elements
  const cabinEls = Array.from(xmlDoc.querySelectorAll('Cabin'));
  if (cabinEls.length === 0) return {};

  // 📊 Extract all firstRow and lastRow values, convert to integers
  const firstRows = cabinEls.map(c => parseInt(c.getAttribute('firstRow') || '', 10)).filter(n => !isNaN(n));
  const lastRows = cabinEls.map(c => parseInt(c.getAttribute('lastRow') || '', 10)).filter(n => !isNaN(n));

  if (firstRows.length === 0 || lastRows.length === 0) return {};

  // 📌 Determine min and max row numbers across all cabins
  const minRow = Math.min(...firstRows);
  const maxRow = Math.max(...lastRows);

  // 🧱 Get all <Row> elements
  const rowEls = Array.from(xmlDoc.querySelectorAll('Row'));

  // 🔎 Locate <Row> element for the start and end row numbers
  const firstRowEl = rowEls.find(r => parseInt(r.querySelector('RowNumber')?.textContent || '', 10) === minRow);
  const lastRowEl = rowEls.find(r => parseInt(r.querySelector('RowNumber')?.textContent || '', 10) === maxRow);

  /**
   * 🧠 Extracts valid seat letters (A, B, C, ...) from a row element.
   * Filters out seats marked as unusable (e.g. NoSeatHere, NoSeatAtThisLocation).
   */
  const extractValidSeatLetters = (rowEl: Element | undefined): string[] => {
    if (!rowEl) return [];

    const validLetters = new Set<string>();
    const seatEls = Array.from(rowEl.querySelectorAll('Seat'));

    for (const seatEl of seatEls) {
      const number = seatEl.querySelector('Number')?.textContent?.trim();
      if (!number || !/^[A-Z]$/.test(number)) continue;

      const occupation = seatEl.querySelector('Occupation > Detail')?.textContent;
      const location = seatEl.querySelector('Location > Detail')?.textContent;

      const isNoSeat = occupation === 'NoSeatHere' || location === 'NoSeatAtThisLocation';
      if (!isNoSeat) {
        validLetters.add(number);
      }
    }

    return Array.from(validLetters).sort();
  };

  const startLetters = extractValidSeatLetters(firstRowEl);
  const endLetters = extractValidSeatLetters(lastRowEl);

  console.log('🧩 SeatMap Debug:', {
    minRow,
    maxRow,
    startLetters,
    endLetters,
  });

  // ❌ Fallback if seat letters are missing
  if (startLetters.length === 0 || endLetters.length === 0) return {};

  // ✅ Return format: 'rowNumber:seatLetters'
  return {
    startRow: `${minRow}:${startLetters.join('')}`,
    endRow: `${maxRow}:${endLetters.join('')}`,
  };
}