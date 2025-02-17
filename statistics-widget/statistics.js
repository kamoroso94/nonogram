import {getTimeFrameStart} from '../utils/time.js';

/** @import {TimeFrame} from '../utils/time.js' */

export const DIFFICULTIES = /** @type {const} */ (['easy', 'medium', 'hard']);
/** @typedef {typeof DIFFICULTIES[number]} Difficulty */

export const DIMENSIONS = /** @type {const} */ ([5, 10, 15, 20]);
/** @typedef {typeof DIMENSIONS[number]} Dimension */

/** @typedef {`${Difficulty}-${Dimension}`} StatsKey */

// NOTE: Remember to render new changes.
/**
 * A statistics entry for a nonogram game.
 * @typedef Statistics
 * @property {number} totalSolved
 * @property {number} bestTime
 */

/**
 * Maps difficulty and dimension to a statistics entry.
 * @typedef {!Partial<Record<StatsKey, !Statistics>>} StatsTable
 */

/**
 * Records all statistics for every time frame.
 * @typedef TimelyStatistics
 * @property {!Record<TimeFrame, !StatsTable>} timeFrames
 * @property {!Record<TimeFrame, number>} timeFrameStarts
 */

/**
 * Creates an empty `TimelyStatistics` object.
 * @param {Date} [now]
 * @returns {!TimelyStatistics}
 */
export function createTimelyStatistics(now) {
  return {
    timeFrames: {
      'all-time': {},
      'weekly': {},
    },
    timeFrameStarts: {
      'all-time': getTimeFrameStart('all-time', now),
      'weekly': getTimeFrameStart('weekly', now),
    },
  };
}

/** @returns {!Statistics} */
export function createStatistics() {
  return {
    totalSolved: 0,
    bestTime: Infinity,
  };
}

/**
 * Returns a string key representing nonogram games of a specific `difficulty`
 * and `dimension`.
 * @param {!Difficulty} difficulty
 * @param {!Dimension} dimension
 * @returns {StatsKey}
 */
export function getStatsKey(difficulty, dimension) {
  return `${difficulty}-${dimension}`;
}
