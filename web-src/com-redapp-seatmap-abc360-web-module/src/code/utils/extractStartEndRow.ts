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
export function extractStartAndEndRowFromCabin(xmlDoc: Document): {
    startRow?: string;
    endRow?: string;
  } {
    // Locate the first <Cabin> element
    const cabin = xmlDoc.querySelector('Cabin');
    if (!cabin) return {};
  
    // Extract row numbers from attributes
    const firstRow = cabin.getAttribute('firstRow');
    const lastRow = cabin.getAttribute('lastRow');
    if (!firstRow || !lastRow) return {};
  
    // Get all <Row> elements in the document
    const rows = Array.from(xmlDoc.getElementsByTagName('Row'));
  
    /**
     * Helper: returns seat letters (A, B, C...) for a given row number
     */
    const getSeatLetters = (rowNumber: string): string | null => {
      // Find the <Row> with the matching <RowNumber>
      const row = rows.find(r => r.querySelector('RowNumber')?.textContent === rowNumber);
      if (!row) return null;
  
      // Collect all seat letters from <Seat><Number>
      const seatLetters = Array.from(row.getElementsByTagName('Seat'))
        .map(seat => seat.querySelector('Number')?.textContent?.trim())
        .filter(Boolean)
        .map(letter => letter!.toUpperCase())
        .join('');
  
      return seatLetters || null;
    };
  
    const startLetters = getSeatLetters(firstRow);
    const endLetters = getSeatLetters(lastRow);
  
    // If seat letters are missing, return nothing
    if (!startLetters || !endLetters) return {};
  
    // Return formatted row information
    return {
      startRow: `${firstRow}:${startLetters}`,
      endRow: `${lastRow}:${endLetters}`,
    };
  }