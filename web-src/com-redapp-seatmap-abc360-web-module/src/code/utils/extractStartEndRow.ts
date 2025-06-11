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
export function extractStartAndEndRowFromCabin(cabinEl?: Element | null): {
  startRow?: string;
  endRow?: string;
} {
  if (!cabinEl) return {};

  const firstRow = cabinEl.getAttribute('firstRow');
  const lastRow = cabinEl.getAttribute('lastRow');

  const rowLetters = Array.from(cabinEl.querySelectorAll('Row'))
    .flatMap(rowEl =>
      Array.from(rowEl.querySelectorAll('Seat'))
        .map(seatEl => seatEl.querySelector('Number')?.textContent?.trim())
    )
    .filter(Boolean) as string[];

  const seatLetters = Array.from(new Set(rowLetters)).join('');

  if (firstRow && lastRow && seatLetters) {
    return {
      startRow: `${firstRow}:${seatLetters}`,
      endRow: `${lastRow}:${seatLetters}`
    };
  }

  return {};
}