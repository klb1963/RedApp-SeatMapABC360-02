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
  const columnElements = Array.from(xml.querySelectorAll('Column'));

  const seenLetters = new Set<string>();
  const columns: { letter: string; isAisle: boolean }[] = [];

  for (const colEl of columnElements) {
    const rawText = colEl.textContent?.trim() || '';
    const letter = rawText.match(/^[A-Z]$/) ? rawText : '';

    if (!letter || seenLetters.has(letter)) continue;

    const isAisle = Array.from(
      colEl.parentElement?.querySelectorAll(
        'Characteristics > Code, Characteristics > code'
      ) || []
    ).some((codeEl) => codeEl.textContent?.trim() === 'A');

    columns.push({ letter, isAisle });
    seenLetters.add(letter);
  }

  // Fallback: derive letters from real Seat/Number values
  if (columns.length === 0) {
    const seatLetters = Array.from(xml.querySelectorAll('Seat > Number'))
      .map((el) => el.textContent?.trim())
      .filter((value): value is string => !!value && /^[A-Z]$/.test(value));

    Array.from(new Set(seatLetters))
      .sort()
      .forEach((letter) => columns.push({ letter, isAisle: false }));
  }

  let layout: string[] = columns.map((col) => col.letter);

  const aisleIndices = columns
    .map((col, idx) => (col.isAisle ? idx : -1))
    .filter((idx) => idx !== -1);

  if (aisleIndices.length === 2) {
    const [first, second] = aisleIndices;
    if (second - first === 1) {
      layout.splice(second, 0, '|');
    }
  } else if (aisleIndices.length > 2) {
    const first = aisleIndices[0];
    const last = aisleIndices[aisleIndices.length - 1];

    if (last < layout.length) {
      layout.splice(last, 0, '|');
    }
    if (first + 1 < layout.length) {
      layout.splice(first + 1, 0, '|');
    }
  }

  // Narrow-body fallback: common 3-3 layout, aisle between C and D
  if (!layout.includes('|')) {
    const cIndex = layout.indexOf('C');
    const dIndex = layout.indexOf('D');

    if (cIndex !== -1 && dIndex === cIndex + 1) {
      layout.splice(dIndex, 0, '|');
    }
  }

  console.log('[🧩 DEBUG] layoutLetters:', layout);

  return layout;
}