/**
 * ✈️ extractStartAndEndRowFromCabin
 *
 * Extracts `startRow` and `endRow` information from the <Cabin> tag in an EnhancedSeatMapRS XML document.
 * These values help the seatmaps.com library more accurately match aircraft seating layouts.
 *
 * Output example:
 *   {
 *     startRow: "9:ABCDEF",
 *     endRow: "30:ACDF"
 *   }
 *
 * Behavior:
 * - Reads `firstRow` and `lastRow` attributes from the <Cabin> element.
 * - Collects seat letter codes from the corresponding <Row> elements.
 * - Returns both values in the required "RowNumber:LETTERS" format.
 * - If either row or seat letters are missing, returns an empty object.
 *
 * @param xmlDoc A parsed XML Document from EnhancedSeatMapRS
 * @returns An object containing startRow and endRow (or empty if not available)
 */
/**
 * ✈️ extractStartAndEndRowFromCabin
 *
 * Aggregates `firstRow` and `lastRow` from all <Cabin> elements in the XML with matching classCode.
 * Returns rows in format: `${rowNumber}:${seatLetters}` for better compatibility with seatmap libraries.
 *
 * @param xmlDoc Parsed XML Document from EnhancedSeatMapRS
 * @param targetClassCode Class code to match (e.g., 'Y', 'J', 'C')
 */

export function extractStartAndEndRowFromCabin(
  xmlDoc: Document,
  _targetClassCode: string // не нужен больше, но оставим для сигнатуры
): { startRow?: string; endRow?: string } {
  const cabinEls = Array.from(xmlDoc.querySelectorAll('Cabin'));
  if (cabinEls.length === 0) return {};

  const allRows: number[] = [];
  const allSeatLetters = new Set<string>();

  for (const cabinEl of cabinEls) {
    const first = parseInt(cabinEl.getAttribute('firstRow') || '', 10);
    const last = parseInt(cabinEl.getAttribute('lastRow') || '', 10);
    if (!isNaN(first)) allRows.push(first);
    if (!isNaN(last)) allRows.push(last);

    const seatLetters = Array.from(cabinEl.querySelectorAll('Row'))
      .flatMap(rowEl =>
        Array.from(rowEl.querySelectorAll('Seat'))
          .map(seatEl => seatEl.querySelector('Number')?.textContent?.trim())
      )
      .filter(Boolean) as string[];

    seatLetters.forEach(code => {
      const letterMatch = code.match(/[A-Z]/g);
      if (letterMatch) letterMatch.forEach(l => allSeatLetters.add(l));
    });
  }

  if (allRows.length === 0 || allSeatLetters.size === 0) return {};

  const sortedLetters = Array.from(allSeatLetters).sort().join('');
  const minRow = Math.min(...allRows);
  const maxRow = Math.max(...allRows);

  return {
    startRow: `${minRow}:${sortedLetters}`,
    endRow: `${maxRow}:${sortedLetters}`,
  };
}