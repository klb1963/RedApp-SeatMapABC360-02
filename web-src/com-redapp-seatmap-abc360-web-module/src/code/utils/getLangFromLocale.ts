/**
 * getLangFromLocale.ts
 * 
 * 🌐 Utility to map Sabre's full 5-letter locale codes (e.g. en_US, ru_RU)
 * into the 2-letter language codes expected by @seatmaps.com/react-lib.
 */

const localeMap: Record<string, string> = {
    'en_US': 'EN',
    'de_DE': 'DE',
    'es_ES': 'ES',
    'fr_FR': 'FR',
    'it_IT': 'IT',
    'ja_JP': 'JA',
    'ko_KR': 'KO',
    'pt_PT': 'PT',
    'ru_RU': 'RU',
    'tr_TR': 'TR',
    'zh_CN': 'ZH',
    'zh_TW': 'ZH', // Adjust to 'zh-tw' if library distinguishes
  };
  
  /**
   * Converts a 5-letter Sabre locale (e.g. "de_DE") into a 2-letter language code.
   * Falls back to 'en' if locale is unknown or malformed.
   * 
   * @param locale - A full locale string from Sabre (e.g. "fr_FR")
   * @returns 2-letter language code (e.g. "fr")
   */
  export function getLangFromLocale(locale: string): string {
    return localeMap[locale] || 'en';
  }