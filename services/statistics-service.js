import {
  createStatistics,
  createTimelyStatistics,
  getStatsKey,
} from '../statistics-widget/statistics.js';
import {getTimeFrameStart, TIME_FRAMES} from '../utils/time.js';

/**
 * @import {
 *   Difficulty,
 *   Dimension,
 *   Statistics,
 *   TimelyStatistics,
 *   StatsKey,
 *   StatsTable,
 * } from '../statistics-widget/statistics.js'
 * @import {TimeFrame} from '../utils/time.js'
 */

const NONOGRAM_STATS_KEY = 'nonogram-stats';

/**
 * Resets the timely scores if outdated.
 * @param {Date} [date]
 * @returns {boolean} Whether any scores were reset.
 */
function refreshTimelyStats(date) {
  if (!cachedTimelyStats) return false;

  let changed = false;
  for (const timeFrame of TIME_FRAMES) {
    const timeFrameStart = getTimeFrameStart(timeFrame, date);
    if (cachedTimelyStats.timeFrameStarts[timeFrame] >= timeFrameStart) {
      continue;
    }

    cachedTimelyStats.timeFrames[timeFrame] = {};
    cachedTimelyStats.timeFrameStarts[timeFrame] = timeFrameStart;
    changed = true;
  }
  return changed;
}

/** @type {(TimelyStatistics | undefined)} */
let cachedTimelyStats;

/** Clears all nonogram statistics. This action cannot be undone. */
export function clearAllStatistics() {
  cachedTimelyStats = undefined;
  localStorage.removeItem(NONOGRAM_STATS_KEY);
}

/**
 * Returns the cached timely statistics, or reads it from local storage when
 * missing.
 * @returns {!TimelyStatistics}
 */
function getTimelyStatistics() {
  if (cachedTimelyStats) return cachedTimelyStats;

  const data = localStorage.getItem(NONOGRAM_STATS_KEY);
  const now = new Date();
  if (!data) {
    cachedTimelyStats = createTimelyStatistics(now);
    return cachedTimelyStats;
  }

  try {
    cachedTimelyStats = /** @type {!TimelyStatistics} */ (JSON.parse(data));
    if (refreshTimelyStats(now)) recordTimelyStats();
  } catch {
    cachedTimelyStats = createTimelyStatistics(now);
  }
  return cachedTimelyStats;
}

function recordTimelyStats() {
  if (!cachedTimelyStats) return;

  localStorage.setItem(NONOGRAM_STATS_KEY, JSON.stringify(cachedTimelyStats));
}

/**
 * Gets the latest statistics for the given categories.
 * @param {TimeFrame} timeFrame
 * @param {Difficulty} difficulty
 * @param {Dimension} dimension
 * @returns {(Statistics | undefined)}
 */
export function getStatistics(timeFrame, difficulty, dimension) {
  const timelyStats = getTimelyStatistics();
  const statsTable = timelyStats.timeFrames[timeFrame];
  const statsKey = getStatsKey(difficulty, dimension);
  const entry = statsTable[statsKey];
  return entry ? {...entry} : undefined;
}

/**
 * Records a new statistics entry for the completed game.
 * @param {Difficulty} difficulty
 * @param {Dimension} dimension
 * @param {number} totalTime
 */
export function updateStatistics(difficulty, dimension, totalTime) {
  const timelyStats = getTimelyStatistics();
  const statsKey = getStatsKey(difficulty, dimension);

  refreshTimelyStats();
  for (const timeFrame of TIME_FRAMES) {
    updateStatsTable(statsKey, timelyStats.timeFrames[timeFrame], totalTime);
  }
  recordTimelyStats();
}

/**
 * Updates the recorded statistics.
 * @param {StatsKey} statsKey
 * @param {!StatsTable} statsTable
 * @param {number} totalTime
 */
function updateStatsTable(statsKey, statsTable, totalTime) {
  const entry = (statsTable[statsKey] ??= createStatistics());
  entry.totalSolved++;
  entry.bestTime = Math.min(entry.bestTime, totalTime);
}
