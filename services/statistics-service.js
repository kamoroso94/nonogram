import {
  createStatistics,
  createStatisticsSummary,
} from '../statistics-widget/statistics.js';
import {getWeekStart} from '../utils/time.js';

/**
 * @import {
 *   Statistics,
 *   StatisticsSummary,
 * } from '../statistics-widget/statistics.js'
 */

/** @typedef {('easy' | 'medium' | 'hard')} Difficulty */
/** @typedef {('all-time' | 'weekly')} TimeFrame */

const NONOGRAM_STATS_KEY = 'nonogram-stats';

/**
 * Resets the weekly scores if outdated.
 * @returns {boolean} Whether the scores were reset.
 */
function refreshWeeklyStats() {
  if (!cachedSummary) return false;

  const weekStart = getWeekStart();
  if (cachedSummary.weekStart >= weekStart) return false;

  cachedSummary.weekly.clear();
  cachedSummary.weekStart = weekStart;
  return true;
}

/** @type {(StatisticsSummary | undefined)} */
let cachedSummary;

/** Clears all nonogram statistics. This action cannot be undone. */
export function clearAllStatistics() {
  cachedSummary = undefined;
  localStorage.removeItem(NONOGRAM_STATS_KEY);
}

/**
 * Returns the cached statistics summary, or reads it from local storage when missing.
 * @returns {!StatisticsSummary}
 */
function getSummary() {
  if (cachedSummary) return cachedSummary;

  const data = localStorage.getItem(NONOGRAM_STATS_KEY);
  const now = new Date();
  if (!data) {
    cachedSummary = createStatisticsSummary(now);
    return cachedSummary;
  }

  try {
    cachedSummary = /** @type {!StatisticsSummary} */ (
      JSON.parse(data, (key, value) => {
        return key === 'allTime' || key === 'pastWeek' ? new Map(value) : value;
      })
    );
    if (refreshWeeklyStats()) recordSummary();
  } catch {
    cachedSummary = createStatisticsSummary(now);
  }
  return cachedSummary;
}

function recordSummary() {
  if (!cachedSummary) return;

  localStorage.setItem(
    NONOGRAM_STATS_KEY,
    JSON.stringify(cachedSummary, (_, value) => {
      return value instanceof Map ? [...value] : value;
    })
  );
}

/**
 * Gets the latest statistics for the given categories.
 * @param {!TimeFrame} timeFrame
 * @param {number} gameSize
 * @param {!Difficulty} difficulty
 * @returns {(Statistics | undefined)}
 */
export function getStatistics(timeFrame, gameSize, difficulty) {
  const summary = getSummary();
  const statsMap = timeFrame === 'all-time' ? summary.allTime : summary.weekly;
  const statsKey = `${difficulty}-${gameSize}`;
  const entry = statsMap.get(statsKey);
  return entry ? {...entry} : undefined;
}

/**
 * Records a new statistics entry.
 * @param {number} gameSize
 * @param {!Difficulty} difficulty
 * @param {number} totalTime
 */
export function updateStatistics(gameSize, difficulty, totalTime) {
  const summary = getSummary();
  const statsKey = `${difficulty}-${gameSize}`;

  updateStatsMap(statsKey, summary.allTime, totalTime);
  updateStatsMap(statsKey, summary.weekly, totalTime);
  refreshWeeklyStats();
  recordSummary();
}

/**
 * Updates the recorded statistics.
 * @param {string} statsKey
 * @param {!Map<string, !Statistics>} statsMap
 * @param {number} totalTime
 */
function updateStatsMap(statsKey, statsMap, totalTime) {
  const entry = statsMap.get(statsKey) ?? createStatistics();
  if (!statsMap.has(statsKey)) {
    statsMap.set(statsKey, entry);
  }
  entry.totalSolved++;
  entry.bestTime = Math.min(entry.bestTime, totalTime);
}
