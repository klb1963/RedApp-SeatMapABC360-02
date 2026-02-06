// src/code/utils/logger.ts
const isProd =
  typeof process !== 'undefined'
    ? process.env.NODE_ENV === 'production'
    : true; // на всякий случай считаем продом если переменной нет

// удаляем CR/LF и непечатаемые символы
function sanitize(input: unknown, maxLen = 500): string {
  try {
    const s = typeof input === 'string' ? input : JSON.stringify(input);
    return s
      .replace(/[\r\n]+/g, ' ')        // CR/LF -> пробел
      .replace(/[^\x20-\x7E]+/g, '?')  // control chars -> ?
      .slice(0, maxLen);               // отсечём слишком длинное
  } catch {
    return '[unserializable]';
  }
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (isProd) return; // в проде не логируем debug
    // eslint-disable-next-line no-console
    console.log(...args.map(a => sanitize(a)));
  },
  info:  (...args: unknown[]) => {
    if (isProd) return;
    // eslint-disable-next-line no-console
    console.info(...args.map(a => sanitize(a)));
  },
  warn:  (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.warn(...args.map(a => sanitize(a)));
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error(...args.map(a => sanitize(a)));
  },
};