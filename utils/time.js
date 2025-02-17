import {checkExhaustive} from './asserts';

/** All time frames for which nonogram game statistics are recorded. */
export const TIME_FRAMES = /** @type {const} */ (['all-time', 'weekly']);
/** @typedef {typeof TIME_FRAMES[number]} TimeFrame */

/**
 * Returns a timestamp representing the start of the `timeFrame` in UTC relative
 * to the provided `date`, or the current time frame otherwise.
 * @param {TimeFrame} timeFrame
 * @param {Date} [date]
 * @returns {number}
 */
export function getTimeFrameStart(timeFrame, date) {
  switch (timeFrame) {
    case 'all-time':
      return 0;
    case 'weekly':
      return getWeekStart(date);
    default:
      checkExhaustive(timeFrame, `Unknown time frame "${timeFrame}"`);
  }
}

/**
 * Returns the timestamp for the beginning of the UTC week relative to the given
 * `date`, otherwise relative to now.
 * @param {Date} [date]
 * @returns {number}
 */
function getWeekStart(date) {
  date = new Date(date ?? Date.now());
  date.setUTCHours(/* hours= */ 0, /* min= */ 0, /* sec= */ 0, /* ms= */ 0);
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return date.getTime();
}

/**
 * Rounds to the nearest tenths place.
 * @param {number} value
 * @returns {number}
 */
function roundNearestTenth(value) {
  return Math.round(value * 10) / 10;
}

/**
 * Formats a `duration` in the "H:mm:ss.SSS" format. Hours are not padded.
 * @param {number} duration The duration in milliseconds.
 * @returns {string}
 */
export function formatDuration(duration) {
  duration = Math.floor(roundNearestTenth(duration));
  const milliseconds = String(duration % 1000).padStart(3, '0');
  duration = Math.floor(duration / 1000);
  const seconds = String(duration % 60).padStart(2, '0');
  duration = Math.floor(duration / 60);
  const minutes = String(duration % 60).padStart(2, '0');
  duration = Math.floor(duration / 60);
  const hours = String(duration);

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}
