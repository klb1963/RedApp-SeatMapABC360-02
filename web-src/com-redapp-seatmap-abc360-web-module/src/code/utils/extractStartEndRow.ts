// file: src/code/utils/extractStartEndRow.ts

/**
 * ✈️ extractStartAndEndRowFromCabin
 *
 * Aggregates `firstRow` and `lastRow` from all <Cabin> elements in the XML.
 * Filters out fake seats like NoSeatHere, NoSeatAtThisLocation, and RawSeatCharacteristics codes (e.g., 8, GN).
 * Returns rows in format: `${rowNumber}:${seatLetters}` for compatibility with seatmap libraries.
 *
 * @param xmlDoc Parsed XML Document from EnhancedSeatMapRS
 */
export function extractStartAndEndRowFromCabin(
  xmlDoc: Document
): { startRow?: string; endRow?: string } {
  const cabinEls = Array.from(xmlDoc.querySelectorAll('Cabin'));
  if (cabinEls.length === 0) return {};

  const firstRows = cabinEls.map(c => parseInt(c.getAttribute('firstRow') || '', 10)).filter(n => !isNaN(n));
  const lastRows = cabinEls.map(c => parseInt(c.getAttribute('lastRow') || '', 10)).filter(n => !isNaN(n));

  if (firstRows.length === 0 || lastRows.length === 0) return {};

  const minRow = Math.min(...firstRows);
  const maxRow = Math.max(...lastRows);

  const rowEls = Array.from(xmlDoc.querySelectorAll('Row'));
  const firstRowEl = rowEls.find(r => parseInt(r.querySelector('RowNumber')?.textContent || '', 10) === minRow);
  const lastRowEl = rowEls.find(r => parseInt(r.querySelector('RowNumber')?.textContent || '', 10) === maxRow);

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

  if (startLetters.length === 0 || endLetters.length === 0) return {};

  return {
    startRow: `${minRow}:${startLetters.join('')}`,
    endRow: `${maxRow}:${endLetters.join('')}`,
  };
}