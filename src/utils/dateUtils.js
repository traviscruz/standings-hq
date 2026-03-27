/**
 * Shared date formatting and calculation utilities
 */

/**
 * Formats a date string (YYYY-MM-DD) into a human-readable format.
 * @param {string} dateStr - The date string from input (e.g., '2026-12-05')
 * @returns {string} - Formatted date (e.g., 'December 5, 2026')
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

/**
 * Calculates the duration between two dates inclusive.
 * @param {string} start - Start date (YYYY-MM-DD)
 * @param {string} end - End date (YYYY-MM-DD)
 * @returns {string} - Human-readable duration (e.g., '1 day', '3 days')
 */
export const getDuration = (start, end) => {
  if (!start || !end) return null;
  const s = new Date(start + 'T00:00');
  const e = new Date(end + 'T00:00');
  const diffTime = Math.abs(e - s);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays === 1 ? '1 day' : `${diffDays} days`;
};

/**
 * Returns a human-readable countdown to a specific date and time.
 * @param {string} startDate - Target date (YYYY-MM-DD)
 * @param {string} startTime - Target time (HH:MM)
 * @returns {string|null} - Countdown string (e.g., '3d 12h') or null if date passed
 */
export const getCountdown = (startDate, startTime) => {
  if (!startDate) return null;
  const now = new Date();
  const evDate = new Date(`${startDate}T${startTime || '00:00'}`);
  const diff = evDate - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h`;
};
