// file: /utils/isFallbackMode.ts

export function isFallbackMode(): boolean {
    return typeof window !== 'undefined' && window.name === 'fallback-seatmap';
  }