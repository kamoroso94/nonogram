import {getStatistics} from '../services/statistics-service.js';
import {checkExhaustive, queryElement} from '../utils/asserts.js';
import {formatDuration, TIME_FRAMES} from '../utils/time.js';
import {DIMENSIONS} from './statistics.js';

/**
 * @import {TimeFrame} from '../utils/time.js'
 * @import {Difficulty, Dimension, Statistics} from './statistics.js'
 */

/**
 * Renders the timely statistics tables for the given `difficulty`.
 * @param {string} slotSelector
 * @param {Difficulty} difficulty
 */
export function renderStatistics(slotSelector, difficulty) {
  const slot = queryElement(slotSelector);
  const fragment = document.createDocumentFragment();
  for (const timeFrame of TIME_FRAMES) {
    fragment.append(renderStatisticsTable(timeFrame, difficulty));
  }
  // TODO: use `replaceChildren`, consider reusing DOM.
  slot.replaceWith(fragment);
}

/**
 * Renders a statistics table for the given `timeFrame` and `difficulty`.
 * @param {TimeFrame} timeFrame
 * @param {Difficulty} difficulty
 * @returns {!HTMLTableElement}
 */
function renderStatisticsTable(timeFrame, difficulty) {
  const table = document.createElement('table');
  table.createCaption().append(getTableCaption(timeFrame));
  addFirstRow(table);
  for (const dimension of DIMENSIONS) {
    const entry = getStatistics(timeFrame, difficulty, dimension);
    addStatsRow(table, dimension, entry);
  }
  return table;
}

/**
 * Returns the appropriate table caption for the given `timeFrame`.
 * @param {TimeFrame} timeFrame
 * @returns {string}
 */
function getTableCaption(timeFrame) {
  switch (timeFrame) {
    case 'all-time':
      return 'All Time';
    case 'weekly':
      return 'Weekly';
    default:
      checkExhaustive(timeFrame, `Unknown time frame "${timeFrame}"`);
  }
}

/**
 * Adds the stat headings to the table.
 * @param {!HTMLTableElement} table
 */
function addFirstRow(table) {
  const row = table.insertRow();
  row.insertCell(); // empty corner cell
  row.append(createTableHeader('Solved', 'col'));
  row.append(createTableHeader('Best time', 'col'));
}

/** Maximum displayed time. */
const MAX_TIME = 100 * 60 * 60 * 1000 - 1; // 99:59:59.999

/**
 * Adds the statistics `entry` for the given `dimension` to the `table`.
 * @param {!HTMLTableElement} table
 * @param {Dimension} dimension
 * @param {(Statistics | undefined)} entry
 */
function addStatsRow(table, dimension, entry) {
  const row = table.insertRow();
  row.append(createTableHeader(`${dimension}×${dimension}`, 'row'));

  if (!entry) {
    row.insertCell().append('—');
    row.insertCell().append('—');
    return;
  }

  row.insertCell().append(entry.totalSolved.toLocaleString());
  row.insertCell().append(formatDuration(Math.min(entry.bestTime, MAX_TIME)));
}

/**
 * Generates a table header cell with the given `label` and `scope`.
 * @param {string} label
 * @param {('row' | 'col')} [scope]
 */
function createTableHeader(label, scope) {
  const tableHeader = document.createElement('th');
  if (scope) tableHeader.scope = scope;
  tableHeader.append(label);
  return tableHeader;
}
