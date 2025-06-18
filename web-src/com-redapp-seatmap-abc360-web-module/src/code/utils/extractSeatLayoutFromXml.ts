// file: /code/utils/extractSeatLayoutFromXml.ts

/**
 * Extracts the logical seat layout from XML, including aisle placements
 * Handles edge cases like 2-2-2, 3-3, 1-2-1 without inserting extra aisles
 */

export function extractSeatLayoutFromXml(xml: Document): string[] {
    const columnElements = Array.from(xml.querySelectorAll('Column'));
  
    const columns = columnElements
      .map((colEl) => {
        const letter = colEl.querySelector('Column')?.textContent?.trim();
        const isAisle = Array.from(colEl.querySelectorAll('Characteristics > code'))
          .some((codeEl) => codeEl.textContent === 'A');
        return { letter, isAisle };
      })
      .filter((col) => !!col.letter);
  
    let layout: string[] = columns.map((col) => col.letter!);
    const aisleIndices = columns
      .map((col, idx) => (col.isAisle ? idx : -1))
      .filter((idx) => idx !== -1);
  
    if (aisleIndices.length === 2) {
      // 🔹 Один проход: вставить между двумя креслами с A
      const [first, second] = aisleIndices;
      if (second - first === 1) {
        layout.splice(second, 0, '|');
      }
    } else if (aisleIndices.length > 2) {
      // 🔹 Два прохода: вставить после первого и перед последним
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
