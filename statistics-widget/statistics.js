/**
 * @typedef StatisticsSummary
 * @property {!Map<string, !Statistics>} allTime
 * @property {!Map<string, !Statistics>} weekly
 * @property {number} weekStart
 */

import {getWeekStart} from '../utils/time';

/**
 * @typedef Statistics
 * @property {number} totalSolved
 * @property {number} bestTime
 */

/**
 * @param {Date} [now]
 * @returns {!StatisticsSummary}
 */
export function createStatisticsSummary(now) {
  return {
    allTime: new Map(),
    weekly: new Map(),
    weekStart: getWeekStart(now),
  };
}

/** @returns {!Statistics} */
export function createStatistics() {
  return {
    totalSolved: 0,
    bestTime: Infinity,
  };
}
