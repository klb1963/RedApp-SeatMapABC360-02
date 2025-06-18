// ✅ file: /code/utils/extractSeatLayoutFromXml.ts

/**
 * Extracts the logical seat layout from XML, including aisle placements.
 * Handles dups and malformed Column sections.
 */

export function extractSeatLayoutFromXml(xml: Document): string[] {
    const columnElements = Array.from(xml.querySelectorAll('Column'));
  
    const seenLetters = new Set<string>();
    const columns: { letter: string; isAisle: boolean }[] = [];
  
    for (const colEl of columnElements) {
      const letter = colEl.querySelector('Column')?.textContent?.trim();
      if (!letter || seenLetters.has(letter)) continue;
  
      const isAisle = Array.from(colEl.querySelectorAll('Characteristics > code'))
        .some((codeEl) => codeEl.textContent === 'A');
  
      columns.push({ letter, isAisle });
      seenLetters.add(letter);
    }
  
    let layout: string[] = columns.map((col) => col.letter);
    const aisleIndices = columns
      .map((col, idx) => (col.isAisle ? idx : -1))
      .filter((idx) => idx !== -1);
  
    if (aisleIndices.length === 2) {
      // Один проход — между ними
      const [first, second] = aisleIndices;
      if (second - first === 1) {
        layout.splice(second, 0, '|');
      }
    } else if (aisleIndices.length > 2) {
      // Два прохода — после первого, перед последним
      const first = aisleIndices[0];
      const last = aisleIndices[aisleIndices.length - 1];
  
      if (last < layout.length) {
        layout.splice(last, 0, '|');
      }
      if (first + 1 < layout.length) {
        layout.splice(first + 1, 0, '|');
      }
    }
  
    console.log('[🧩 DEBUG] layoutLetters:', layout);
    return layout;
  }