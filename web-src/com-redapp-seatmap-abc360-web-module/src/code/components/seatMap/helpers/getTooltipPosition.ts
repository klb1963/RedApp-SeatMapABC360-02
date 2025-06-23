// file: /code/components/seatMap/helpers/getTooltipPosition.ts

export function getTooltipPosition(rowIndex: number): 'top' | 'bottom' {
    return rowIndex <= 1 ? 'bottom' : 'top';
  }