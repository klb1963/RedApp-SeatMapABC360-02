// file: /code/components/seatMap/helpers/getTooltipPosition.ts

export function getTooltipPosition(rowIndex: number): 'top' | 'bottom' {
    return rowIndex <= 3 ? 'bottom' : 'top';
  }