// file: /code/components/seatMap/helpers/getTooltipPosition.ts

/**
 * Determines whether the tooltip for a seat should appear above or below the seat.
 * 
 * For rows at the top of the seatmap (e.g. rowIndex 0–3), tooltips appear below to avoid clipping.
 * For other rows, tooltips appear above by default.
 *
 * @param rowIndex - Index of the row in the seat map
 * @returns 'top' or 'bottom' depending on the row position
 */

export function getTooltipPosition(rowIndex: number): 'top' | 'bottom' {
  return rowIndex <= 3 ? 'bottom' : 'top';
}