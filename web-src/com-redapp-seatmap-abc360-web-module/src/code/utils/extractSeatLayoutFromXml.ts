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
  
    const layout: string[] = [];
  
    for (let i = 0; i < columns.length; i++) {
      const curr = columns[i];
      const next = columns[i + 1];
  
      layout.push(curr.letter!);
  
      // ✅ вставляем проход ТОЛЬКО между двумя подряд креслами с характеристикой A
      if (
        next &&
        curr.isAisle &&
        next.isAisle
      ) {
        layout.push('|');
      }
    }
    
    console.log('[🧩 DEBUG] layoutLetters:', layout);

    return layout;
  }

