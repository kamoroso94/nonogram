/**
 * Returns a new `Date` instance representing the start of the week in UTC
 * relative to the provided `date`, or the current week otherwise.
 * @param {Date} [date]
 * @returns {number}
 */
export function getWeekStart(date) {
  date = date ? new Date(date) : new Date();
  date.setUTCHours(0, /* min= */ 0, /* sec= */ 0, /* ms= */ 0);
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return date.getTime();
}
