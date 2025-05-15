// file: code/utils/mapCabinToCode.ts

/**
 * mapCabinToCode.ts
 *
 * 🎟️ Utility for mapping Sabre booking classes (RBD) to
 * internal cabin class codes used by the seat map library.
 *
 * Library expects:
 * - E → Economy
 * - P → Premium Economy
 * - B → Business
 * - F → First
 * - A → All cabins (optional fallback)
 */

/**
 * Maps Sabre booking class (RBD) to seat map cabin code.
 *
 * @param bookingClass - One-letter Sabre RBD (e.g., Y, C, F, M, etc.)
 * @returns Mapped cabin code: E / P / B / F / A
 */
export function mapCabinToCode(bookingClass: string): 'E' | 'P' | 'B' | 'F' | 'A' {
  // 👇 Explicit support for "All cabins"
  if (bookingClass === 'A') return 'A';

  const economy = ['Y', 'H', 'K', 'M', 'L', 'T', 'E', 'U', 'V', 'N'];
  const premiumEconomy = ['W', 'S'];
  const business = ['J', 'C', 'D', 'Z', 'P', 'I'];
  const first = ['F'];

  if (first.includes(bookingClass)) return 'F';
  if (business.includes(bookingClass)) return 'B';
  if (premiumEconomy.includes(bookingClass)) return 'P';
  return 'E'; // Default fallback → Economy
}

/**
 * Maps human-readable UI label (from dropdown, etc.) to seat map cabin code.
 *
 * @param cabin - Label like 'Economy', 'Business', etc.
 * @returns Mapped cabin code: E / P / B / F / A
 */
export function uiCabinLabelToSeatMapCode(cabin: string): 'E' | 'P' | 'B' | 'F' | 'A' {
  switch (cabin) {
    case 'Economy':
      return 'E';
    case 'PremiumEconomy':
      return 'P';
    case 'Business':
      return 'B';
    case 'First':
      return 'F';
    default:
      return 'A'; // Used as fallback: All cabins
  }
}

/**
 * Safe variant of mapCabinToCode that never returns 'A'.
 * Use this when the visualization library does not support A.
 *
 * @param bookingClass - Sabre RBD code
 * @returns Cabin code E / P / B / F (never A)
 */
export function mapCabinToCodeSafe(bookingClass: string): 'E' | 'P' | 'B' | 'F' {
  const result = mapCabinToCode(bookingClass);
  return result === 'A' ? 'E' : result;
}