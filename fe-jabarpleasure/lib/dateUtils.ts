/**
 * Date and Time Formatting Utilities for JabarPleasure WebGIS
 * Formats dates, ranges, and destination visit times into clean Indonesian locale strings.
 */

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const DAY_NAMES = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

/**
 * Convert any date (ISO string, YYYY-MM-DD, or timestamp) into a clean Indonesian date.
 * E.g., "2026-11-16T00:00:00.000000Z" -> "16 Nov 2026"
 */
export function formatHumanDate(dateInput?: string | null): string {
  if (!dateInput) {
    const now = new Date();
    return `${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  }

  const trimmed = String(dateInput).trim();
  if (trimmed === 'Hari ini' || trimmed === 'Baru saja') {
    return trimmed;
  }

  // Already formatted like "16 Nov 2026" or "Senin, 16 Nov 2026"
  if (/^[A-Za-z]+,\s*\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(trimmed) || /^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle ISO or date strings
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getDate()} ${MONTH_NAMES[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }

  // Fallback regex match for YYYY-MM-DD
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    const mIdx = parseInt(m, 10) - 1;
    const mName = MONTH_NAMES[mIdx] || m;
    return `${parseInt(d, 10)} ${mName} ${y}`;
  }

  return trimmed;
}

/**
 * Format destination visit time, removing raw ISO timestamps.
 * E.g., "2026-11-16T00:00:00.000000Z • Selesai" -> "16 Nov 2026 • Selesai"
 */
export function formatDestinationTime(timeStr?: string | null, fallbackDate?: string | null): string {
  if (!timeStr) {
    return `${formatHumanDate(fallbackDate)} • Selesai`;
  }

  const trimmed = String(timeStr).trim();

  // Robust ISO 8601 regex covering date, optional time (T or space), microseconds, Z or timezone offset
  const isoRegex = /\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?/g;

  const cleaned = trimmed.replace(isoRegex, (match) => {
    return formatHumanDate(match);
  });

  if (!cleaned.toLowerCase().includes('selesai') && !cleaned.toLowerCase().includes('dikunjungi')) {
    return `${cleaned} • Selesai`;
  }

  return cleaned;
}

/**
 * Format date with day name.
 * E.g. "Minggu, 16 Nov 2026"
 */
export function formatCompletedDayDate(dateStr?: string | null): string {
  if (!dateStr) {
    const now = new Date();
    return `${DAY_NAMES[now.getDay()]}, ${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  }

  const trimmed = String(dateStr).trim();
  if (DAY_NAMES.some((d) => trimmed.includes(d))) {
    return trimmed;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return `${DAY_NAMES[parsed.getDay()]}, ${parsed.getDate()} ${MONTH_NAMES[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }

  // Fallback regex match for YYYY-MM-DD
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    return `${DAY_NAMES[dateObj.getDay()]}, ${parseInt(d, 10)} ${MONTH_NAMES[dateObj.getMonth()]} ${y}`;
  }

  return formatHumanDate(trimmed);
}
