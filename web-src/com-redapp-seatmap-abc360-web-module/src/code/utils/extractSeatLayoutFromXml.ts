// ✅ file: /code/utils/extractSeatLayoutFromXml.ts

/**
 * extractSeatLayoutFromXml.ts
 *
 * 🧩 Extracts seat layout letters from EnhancedSeatMapRS XML.
 * Identifies which seat columns exist and where aisles should be inserted.
 *
 * This is used to reconstruct the seat map grid, including aisle positions.
 */

export function extractSeatLayoutFromXml(xml: Document): string[] {
  // 🔍 Locate all <Column> elements in the XML
  const columnElements = Array.from(xml.querySelectorAll('Column'));

  const seenLetters = new Set<string>();
  const columns: { letter: string; isAisle: boolean }[] = [];

  // 🧱 Extract seat letter and detect if it's an aisle
  for (const colEl of columnElements) {
    const letter = colEl.querySelector('Column')?.textContent?.trim();
    if (!letter || seenLetters.has(letter)) continue;

    const isAisle = Array.from(colEl.querySelectorAll('Characteristics > code'))
      .some((codeEl) => codeEl.textContent === 'A');

    columns.push({ letter, isAisle });
    seenLetters.add(letter);
  }

  // 🎯 Initial layout: just seat letters (e.g. ['A', 'B', 'C', 'D', 'E', 'F'])
  let layout: string[] = columns.map((col) => col.letter);

  // 🪑 Indices of aisle-marked columns
  const aisleIndices = columns
    .map((col, idx) => (col.isAisle ? idx : -1))
    .filter((idx) => idx !== -1);

  // 🧠 Apply logic to insert '|' (aisle) in layout
  if (aisleIndices.length === 2) {
    // 🧍 Single aisle between two seats
    const [first, second] = aisleIndices;
    if (second - first === 1) {
      layout.splice(second, 0, '|');
    }
  } else if (aisleIndices.length > 2) {
    // ✈️ Widebody with two aisles: insert after first and before last
    const first = aisleIndices[0];
    const last = aisleIndices[aisleIndices.length - 1];

    if (last < layout.length) {
      layout.splice(last, 0, '|');
    }
    if (first + 1 < layout.length) {
      layout.splice(first + 1, 0, '|');
    }
  }

  // 🪄 Return layout letters with aisles inserted (e.g. ['A', 'B', '|', 'C', 'D'])
  console.log('[🧩 DEBUG] layoutLetters:', layout);
  return layout;
}