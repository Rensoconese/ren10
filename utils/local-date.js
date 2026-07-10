/** Parse an ISO civil date without applying a UTC timezone conversion. */
export function parseLocalDate(value) {
  if (value instanceof Date) return new Date(value.getTime());

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return new Date(NaN);

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return new Date(NaN);
  }
  return date;
}

/** Format a Date as an ISO civil date using local calendar fields. */
export function formatLocalDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Clamp a civil date to optional inclusive local-date bounds. */
export function clampLocalDate(value, min = null, max = null) {
  const date = parseLocalDate(value);
  if (Number.isNaN(date.getTime())) return date;

  const minimum = min == null ? null : parseLocalDate(min);
  const maximum = max == null ? null : parseLocalDate(max);
  if (minimum && !Number.isNaN(minimum.getTime()) && date < minimum) return minimum;
  if (maximum && !Number.isNaN(maximum.getTime()) && date > maximum) return maximum;
  return date;
}
