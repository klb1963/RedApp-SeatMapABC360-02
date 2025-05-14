// 
import { colorPalette } from '../utils/colorPalette';

/**
 * Returns a color for a passenger based on index from predefined palette.
 */
export function getPassengerColor(index: number): string {
  return colorPalette[index % colorPalette.length];
}