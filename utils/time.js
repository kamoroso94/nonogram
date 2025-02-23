import {assertUnreachable} from './asserts.js';

/** All time frames for which nonogram game statistics are recorded. */
export const TIME_FRAMES = /** @type {const} */ (['all-time', 'weekly']);
/** @typedef {typeof TIME_FRAMES[number]} TimeFrame */

/**
 * Returns a timestamp representing the start of the `timeFrame` in UTC relative
 * to the provided `date`, or the current time frame otherwise.
 * @param {TimeFrame} timeFrame
 * @param {!Date} [date]
 * @returns {number}
 */
export function getTimeFrameStart(timeFrame, date) {
  switch (timeFrame) {
    case 'all-time':
      return 0;
    case 'weekly':
      return getWeekStart(date);
    default:
      assertUnreachable(timeFrame, `Unknown time frame "${timeFrame}"`);
  }
}

/**
 * Returns the timestamp for the beginning of the UTC week relative to the given
 * `date`, otherwise relative to now.
 * @param {!Date} [date]
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
 * Represents a duration down to the millisecond, with the coarsest unit being
 * days.
 * @typedef {object} Duration
 * @property {number} days
 * @property {number} hours
 * @property {number} minutes
 * @property {number} seconds
 * @property {number} milliseconds
 */

/**
 * Partitions a duration in milliseconds into a `Duration` object.
 * @param {number} durationMillis
 * @returns {!Duration}
 */
function partitionDuration(durationMillis) {
  let time = Math.floor(roundNearestTenth(durationMillis));
  const milliseconds = time % 1000;
  time = Math.floor(time / 1000);
  const seconds = time % 60;
  time = Math.floor(time / 60);
  const minutes = time % 60;
  time = Math.floor(time / 60);
  const hours = time % 24;
  time = Math.floor(time / 24);
  const days = time;

  return {
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
  };
}

/**
 * Returns a duration in the ISO 8601 "PnDTnHnMnS" format.
 * @param {number} durationMillis
 * @returns {string}
 */
export function durationToIsoString(durationMillis) {
  if (!durationMillis) return 'PT0S';

  const {days, hours, minutes, seconds, milliseconds} =
    partitionDuration(durationMillis);
  const d = days ? days + 'D' : '';
  const h = hours ? hours + 'H' : '';
  const m = minutes ? minutes + 'M' : '';
  const fractionalSeconds = seconds + milliseconds / 1000;
  const s = fractionalSeconds ? fractionalSeconds + 'S' : '';
  return `P${d}${h}${m}${s}`;
}

/**
 * Formats a duration in the "H:mm:ss.SSS" format. Hours are not padded.
 * @param {number} durationMillis
 * @returns {string}
 */
export function formatDuration(durationMillis) {
  const {days, hours, minutes, seconds, milliseconds} =
    partitionDuration(durationMillis);
  const h = days * 24 + hours;
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');
  const ms = String(milliseconds).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}
