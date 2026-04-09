/**
 * RenDS — Internationalization (i18n)
 * ====================================
 * Lightweight i18n utility for RenDS components.
 *
 * Features:
 * - English default locale with all component strings
 * - Register additional locales dynamically
 * - Template parameter substitution (e.g., {count}, {current})
 * - Simple pluralization support (pipe-separated strings)
 * - Auto-fallback to English for missing keys
 * - Read active locale from <html lang=""> attribute
 *
 * Usage:
 *   import { t, setLocale, registerLocale } from './i18n.js';
 *
 *   // Use default English
 *   t('dialog.close'); // "Close"
 *
 *   // Register Spanish
 *   registerLocale('es', {
 *     dialog: { close: 'Cerrar' },
 *     toast: { close: 'Descartar' }
 *   });
 *
 *   // Switch locale
 *   setLocale('es');
 *   t('dialog.close'); // "Cerrar"
 *
 *   // Template parameters
 *   t('carousel.slideOf', { current: 3, total: 10 }); // "Slide 3 of 10"
 *
 *   // Pluralization (pipe-separated)
 *   t('dateRangePicker.daysSelected', { count: 1 }); // "1 day"
 *   t('dateRangePicker.daysSelected', { count: 7 }); // "7 days"
 */

/* ═══ DEFAULT ENGLISH LOCALE ═══ */

const defaultLocale = {
  calendar: {
    previousMonth: 'Previous month ({month})',
    nextMonth: 'Next month ({month})',
  },

  carousel: {
    label: 'Image carousel',
    previous: 'Previous slide',
    next: 'Next slide',
    slideOf: 'Slide {current} of {total}',
  },

  combobox: {
    placeholder: 'Search...',
    noResults: 'No results found',
  },

  command: {
    placeholder: 'Type a command or search...',
    noResults: 'No results found',
  },

  dateRangePicker: {
    placeholder: 'Select date range',
    apply: 'Apply',
    cancel: 'Cancel',
    selectStart: 'Select a start date',
    today: 'Today',
    yesterday: 'Yesterday',
    last7: 'Last 7 days',
    last14: 'Last 14 days',
    last30: 'Last 30 days',
    last90: 'Last 90 days',
    thisWeek: 'This week',
    lastWeek: 'Last week',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    thisQuarter: 'This quarter',
    thisYear: 'This year',
    lastYear: 'Last year',
    daysSelected: '{count} day|{count} days',
  },

  datePicker: {
    placeholder: 'Select date',
  },

  dialog: {
    close: 'Close',
  },

  dropzone: {
    label: 'Drop files here or click to browse',
    dragActive: 'Drop files here',
  },

  form: {
    required: 'This field is required',
    email: 'Please enter a valid email',
    minLength: 'Must be at least {min} characters',
    maxLength: 'Must be no more than {max} characters',
    pattern: 'Invalid format',
    match: 'Fields do not match',
  },

  numberField: {
    decrease: 'Decrease',
    increase: 'Increase',
  },

  otp: {
    digitLabel: 'Code digit {current} of {total}',
  },

  select: {
    placeholder: 'Select an option',
    noResults: 'No options available',
  },

  sheet: {
    close: 'Close sheet',
  },

  toast: {
    close: 'Dismiss',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
  },

  sidebar: {
    collapse: 'Collapse sidebar',
    expand: 'Expand sidebar',
  },

  table: {
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    noData: 'No data',
    loading: 'Loading...',
    selected: '{count} selected',
  },

  nav: {
    menu: 'Navigation menu',
    toggle: 'Toggle menu',
  },
};

/* ═══ STATE ═══ */

const locales = {
  en: defaultLocale,
};

let activeLocale = 'en';

/* ═══ UTILITY FUNCTIONS ═══ */

/**
 * Get value from nested object using dot notation.
 * Example: getValue(obj, 'dialog.close')
 *
 * @param {Object} obj - Object to navigate
 * @param {string} path - Dot-notation path
 * @returns {*} Value at path, or undefined
 */
function getValue(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }

  return current;
}

/**
 * Handle pluralization via pipe-separated strings.
 * Example: "{count} day|{count} days"
 *
 * @param {string} text - Pipe-separated string
 * @param {number} count - Count value
 * @returns {string} Selected variant
 */
function selectPlural(text, count) {
  const variants = text.split('|');

  if (variants.length === 1) {
    return text;
  }

  // Simple rule: use second variant if count !== 1
  return count === 1 ? variants[0] : variants[1];
}

/**
 * Replace template parameters in a string.
 * Example: "Slide {current} of {total}" with { current: 3, total: 10 }
 *
 * @param {string} text - Template string
 * @param {Object} params - Parameters to substitute
 * @returns {string} Interpolated string
 */
function interpolate(text, params = {}) {
  if (!params || typeof params !== 'object') {
    return text;
  }

  return text.replace(/\{([^}]+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match;
  });
}

/* ═══ INITIALIZATION ═══ */

/**
 * Detect locale from <html lang=""> attribute.
 * Falls back to 'en' if not set or not registered.
 */
function detectLocale() {
  const htmlLang = document.documentElement?.getAttribute('lang');
  if (htmlLang && locales[htmlLang]) {
    return htmlLang;
  }
  return 'en';
}

// Try to set active locale from HTML lang attribute on page load
if (typeof document !== 'undefined') {
  try {
    activeLocale = detectLocale();
  } catch (e) {
    // Fall back to 'en' if document is not available
    activeLocale = 'en';
  }
}

/* ═══ PUBLIC API ═══ */

/**
 * Translate a key with optional parameters.
 * Supports nested keys (e.g., 'dialog.close'), template parameters,
 * and pluralization. Falls back to English if key is missing.
 *
 * @param {string} key - Translation key (dot-notation for nested)
 * @param {Object} params - Template and plural parameters
 * @returns {string} Translated string
 *
 * @example
 *   t('dialog.close'); // "Close"
 *   t('carousel.slideOf', { current: 3, total: 10 }); // "Slide 3 of 10"
 *   t('dateRangePicker.daysSelected', { count: 7 }); // "7 days"
 */
export function t(key, params = {}) {
  // Get value from active locale
  let value = getValue(locales[activeLocale], key);

  // Fall back to English if not found
  if (value === undefined) {
    value = getValue(defaultLocale, key);
  }

  // If still not found, return key itself
  if (value === undefined) {
    console.warn(`[i18n] Missing translation: ${key}`);
    return key;
  }

  // Handle pluralization if count is provided
  if (params.count !== undefined) {
    value = selectPlural(value, params.count);
  }

  // Interpolate parameters
  return interpolate(value, params);
}

/**
 * Register a new locale.
 * Locales can be partial (only include the keys you want to override).
 * Missing keys will fall back to English.
 *
 * @param {string} localeCode - Locale code (e.g., 'es', 'fr-CA')
 * @param {Object} translation - Translation object (can be partial)
 *
 * @example
 *   registerLocale('es', {
 *     dialog: { close: 'Cerrar' },
 *     toast: { close: 'Descartar' }
 *   });
 */
export function registerLocale(localeCode, translation) {
  if (!localeCode || typeof localeCode !== 'string') {
    throw new Error('[i18n] localeCode must be a non-empty string');
  }

  if (!translation || typeof translation !== 'object') {
    throw new Error('[i18n] translation must be an object');
  }

  locales[localeCode] = translation;
}

/**
 * Set the active locale.
 * The locale must be registered before switching to it.
 *
 * @param {string} localeCode - Locale code (e.g., 'es', 'fr-CA')
 *
 * @example
 *   setLocale('es');
 *   t('dialog.close'); // Returns Spanish translation
 */
export function setLocale(localeCode) {
  if (!localeCode || typeof localeCode !== 'string') {
    throw new Error('[i18n] localeCode must be a non-empty string');
  }

  if (!(localeCode in locales)) {
    throw new Error(
      `[i18n] Locale '${localeCode}' is not registered. ` +
      'Call registerLocale() first.'
    );
  }

  activeLocale = localeCode;
}

/**
 * Get the currently active locale code.
 *
 * @returns {string} Active locale code
 */
export function getLocale() {
  return activeLocale;
}

/**
 * Get all registered locale codes.
 *
 * @returns {string[]} Array of registered locale codes
 */
export function getAvailableLocales() {
  return Object.keys(locales);
}

/**
 * Get the complete translation object for a locale.
 * Useful for advanced use cases.
 *
 * @param {string} localeCode - Locale code (defaults to active locale)
 * @returns {Object} Complete translation object
 */
export function getLocaleData(localeCode = activeLocale) {
  return locales[localeCode] || defaultLocale;
}

/* ═══ SPANISH EXAMPLE LOCALE ═══ */

registerLocale('es', {
  calendar: {
    previousMonth: 'Mes anterior ({month})',
    nextMonth: 'Próximo mes ({month})',
  },

  carousel: {
    label: 'Carrusel de imágenes',
    previous: 'Diapositiva anterior',
    next: 'Siguiente diapositiva',
    slideOf: 'Diapositiva {current} de {total}',
  },

  combobox: {
    placeholder: 'Buscar...',
    noResults: 'No se encontraron resultados',
  },

  command: {
    placeholder: 'Escribe un comando o busca...',
    noResults: 'No se encontraron resultados',
  },

  dateRangePicker: {
    placeholder: 'Seleccionar rango de fechas',
    apply: 'Aplicar',
    cancel: 'Cancelar',
    selectStart: 'Selecciona una fecha de inicio',
    today: 'Hoy',
    yesterday: 'Ayer',
    last7: 'Últimos 7 días',
    last14: 'Últimos 14 días',
    last30: 'Últimos 30 días',
    last90: 'Últimos 90 días',
    thisWeek: 'Esta semana',
    lastWeek: 'Última semana',
    thisMonth: 'Este mes',
    lastMonth: 'Mes pasado',
    thisQuarter: 'Este trimestre',
    thisYear: 'Este año',
    lastYear: 'Año pasado',
    daysSelected: '{count} día|{count} días',
  },

  datePicker: {
    placeholder: 'Seleccionar fecha',
  },

  dialog: {
    close: 'Cerrar',
  },

  dropzone: {
    label: 'Suelta los archivos aquí o haz clic para examinar',
    dragActive: 'Suelta los archivos aquí',
  },

  form: {
    required: 'Este campo es obligatorio',
    email: 'Por favor ingresa un correo electrónico válido',
    minLength: 'Debe tener al menos {min} caracteres',
    maxLength: 'No debe tener más de {max} caracteres',
    pattern: 'Formato inválido',
    match: 'Los campos no coinciden',
  },

  numberField: {
    decrease: 'Disminuir',
    increase: 'Aumentar',
  },

  otp: {
    digitLabel: 'Dígito de código {current} de {total}',
  },

  select: {
    placeholder: 'Selecciona una opción',
    noResults: 'No hay opciones disponibles',
  },

  sheet: {
    close: 'Cerrar panel',
  },

  toast: {
    close: 'Descartar',
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información',
  },

  sidebar: {
    collapse: 'Contraer barra lateral',
    expand: 'Expandir barra lateral',
  },

  table: {
    sortAscending: 'Ordenar ascendente',
    sortDescending: 'Ordenar descendente',
    noData: 'Sin datos',
    loading: 'Cargando...',
    selected: '{count} seleccionado|{count} seleccionados',
  },

  nav: {
    menu: 'Menú de navegación',
    toggle: 'Alternar menú',
  },
});
